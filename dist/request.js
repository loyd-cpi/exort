"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const misc_1 = require("./misc");
const formidable = require("formidable");
const filesystem_1 = require("./filesystem");
const pathlib = require("path");
const bytes = require("bytes");
const os = require("os");
const fs = require("fs");
const qs = require('qs');
/**
 * Install body parser
 * @param  {T} app
 * @return {void}
 */
function installBodyParser(app, rootDir) {
    app_1.checkAppConfig(app);
    let requestConf = app.locals.config.get('request') || {};
    requestConf.encoding = requestConf.encoding || 'utf-8';
    requestConf.postMaxSize = requestConf.postMaxSize || '2MB';
    requestConf.uploadMaxSize = requestConf.uploadMaxSize || '5MB';
    requestConf.tmpUploadDir = requestConf.tmpUploadDir || os.tmpdir();
    if (!pathlib.isAbsolute(requestConf.tmpUploadDir)) {
        requestConf.tmpUploadDir = pathlib.join(rootDir, requestConf.tmpUploadDir);
    }
    let postMaxSize = bytes.parse(requestConf.postMaxSize);
    let uploadMaxSize = bytes.parse(requestConf.uploadMaxSize);
    app.use((req, res, next) => {
        req.body = {};
        req._files = {};
        let form = new formidable.IncomingForm();
        form.encoding = requestConf.encoding;
        form.uploadDir = requestConf.tmpUploadDir;
        form.maxFieldsSize = postMaxSize;
        form.multiples = true;
        form.keepExtensions = true;
        form.parse(req, (err, fields, files) => {
            if (err)
                return next(err);
            if (fields) {
                req.body = qs.parse(fields);
            }
            let totalUploadSize = 0;
            if (files) {
                for (let key in files) {
                    if (Array.isArray(files[key])) {
                        req._files[key] = [];
                        req._files[key].forEach((file) => {
                            let uploaded = new UploadedFile(file);
                            totalUploadSize += uploaded.size;
                            req._files[key].push(uploaded);
                        });
                    }
                    else {
                        let uploaded = new UploadedFile(files[key]);
                        totalUploadSize += uploaded.size;
                        req._files[key] = uploaded;
                    }
                }
            }
            if (totalUploadSize > uploadMaxSize) {
                return next(new Error('Reached upload max size'));
            }
            req.input = new Input(req);
            next();
        });
    });
}
exports.installBodyParser = installBodyParser;
/**
 * Input class
 */
class Input extends misc_1.Store {
    /**
     * Input constructor
     * @param {Request} private req
     */
    constructor(req) {
        super();
        this.req = req;
        let content = {};
        switch (req.method) {
            case 'GET':
            case 'DELETE':
                content = this.req.query || this.req._query;
                break;
            default:
                content = this.req.body;
                break;
        }
        this.content = content;
        this.fileInput = this.req._files || {};
    }
    /**
     * Get input except for specified fields
     * @param  {string[]} exception
     * @return {KeyValuePair<any>}
     */
    except(exception) {
        let values = {};
        let allInput = this.all();
        if (typeof allInput == 'object') {
            for (let field in allInput) {
                if (exception.indexOf(field) == -1) {
                    values[field] = allInput[field];
                }
            }
        }
        return values;
    }
    /**
     * Get input only for specified fields
     * @param  {string[]} fields
     * @return {KeyValuePair<any>}
     */
    only(fields) {
        let values = {};
        for (let field of fields) {
            let value = this.get(field);
            if (typeof value != 'undefined') {
                values[field] = value;
            }
        }
        return values;
    }
    /**
     * Has file
     * @param  {string} key
     * @return {boolean}
     */
    hasFile(key) {
        return this.file(key) ? true : false;
    }
    /**
     * Get input file
     * @param  {string} key
     * @return {UploadedFile}
     */
    file(key) {
        if (!this.fileInput || !this.fileInput[key])
            return;
        if (Array.isArray(this.fileInput[key])) {
            return this.fileInput[key][0];
        }
        return this.fileInput[key];
    }
    /**
     * Get input files
     * @param  {string} key
     * @return {UploadedFile[]}
     */
    files(key) {
        if (!this.fileInput || !this.fileInput[key])
            return;
        if (!Array.isArray(this.fileInput[key])) {
            return [this.fileInput[key]];
        }
        return this.fileInput[key];
    }
}
exports.Input = Input;
/**
 * UploadedFile class
 */
class UploadedFile extends filesystem_1.File {
    /**
     * UploadedFile constructor
     * @param {formidable.File} uploaded
     */
    constructor(uploaded) {
        super({
            name: uploaded.name,
            path: uploaded.path,
            type: uploaded.type,
            hash: uploaded.hash,
            size: uploaded.size,
            lastModifiedDate: uploaded.lastModifiedDate
        });
        /**
         * Flag if uploaded file is already moved to another location
         * @type {boolean}
         */
        this.moved = false;
        /**
         * Flag if uploaded file is currently in process
         * @type {boolean}
         */
        this.processing = false;
    }
    /**
     * Get JSON Object
     * @return {KeyValuePair<any>}
     */
    toJSON() {
        return {
            name: this.name,
            path: this.path,
            type: this.type,
            hash: this.hash,
            size: this.size,
            lastModifiedDate: this.lastModifiedDate
        };
    }
    /**
     * Check availability of file for processing
     */
    isMovedOrInProcess() {
        return this.moved || this.processing;
    }
    /**
     * Move uploaded file
     * @param  {string} destination
     * @param  {string} fileName
     * @return {Promise<boolean>}
     */
    move(destination, fileName) {
        if (this.isMovedOrInProcess()) {
            throw new Error('File is already moved or in process');
        }
        this.processing = true;
        destination = pathlib.join(destination, fileName || this.name);
        return new Promise((resolve, reject) => {
            fs.rename(this.path, destination, err => {
                this.processing = false;
                if (err) {
                    return reject(err);
                }
                this.name = pathlib.basename(destination);
                this.path = pathlib.resolve(destination);
                this.moved = true;
                resolve(true);
            });
        });
    }
    /**
     * Delete temporary file
     * @return {Promise<boolean>}
     */
    deleteTempFile() {
        return new Promise((resolve, reject) => {
            if (this.isMovedOrInProcess()) {
                return resolve(false);
            }
            fs.unlink(this.path, err => {
                if (err)
                    return reject(err);
                resolve(true);
            });
        });
    }
}
exports.UploadedFile = UploadedFile;
//# sourceMappingURL=request.js.map