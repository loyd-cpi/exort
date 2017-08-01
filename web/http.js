"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("../core/app");
const misc_1 = require("../core/misc");
const error_1 = require("./error");
const filesystem_1 = require("../core/filesystem");
const formidable = require("formidable");
const error_2 = require("../core/error");
const pathlib = require("path");
const bytes = require("bytes");
const http = require("http");
const os = require("os");
const fs = require("fs");
const qs = require('qs');
/**
 * Install body parser
 */
function provideBodyParser() {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        let requestConf = app.config.get('request') || {};
        requestConf.encoding = requestConf.encoding || 'utf-8';
        requestConf.postMaxSize = requestConf.postMaxSize || '2MB';
        requestConf.uploadMaxSize = requestConf.uploadMaxSize || '5MB';
        requestConf.tmpUploadDir = requestConf.tmpUploadDir || os.tmpdir();
        if (!pathlib.isAbsolute(requestConf.tmpUploadDir)) {
            requestConf.tmpUploadDir = pathlib.join(app.rootDir, requestConf.tmpUploadDir);
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
                            for (let file of files[key]) {
                                let uploaded = new UploadedFile(file);
                                totalUploadSize += uploaded.size;
                                req._files[key].push(uploaded);
                            }
                        }
                        else {
                            let uploaded = new UploadedFile(files[key]);
                            totalUploadSize += uploaded.size;
                            req._files[key] = uploaded;
                        }
                    }
                }
                if (totalUploadSize > uploadMaxSize) {
                    return next(new error_2.Error('Reached upload max size'));
                }
                req.input = new Input(req);
                next();
            });
        });
    });
}
exports.provideBodyParser = provideBodyParser;
/**
 * Input class
 */
class Input extends misc_1.Store {
    /**
     * Input constructor
     */
    constructor(req) {
        super();
        let content = {};
        switch (req.method) {
            case 'GET':
            case 'DELETE':
                content = req.query || req._query;
                break;
            default:
                content = req.body;
                break;
        }
        this.content = content;
        this.fileInput = req._files || {};
    }
    /**
     * Get input except for specified fields
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
     */
    hasFile(key) {
        return this.file(key) ? true : false;
    }
    /**
     * Get input file
     */
    file(key) {
        if (Array.isArray(this.fileInput[key])) {
            return this.fileInput[key][0];
        }
        return this.fileInput[key];
    }
    /**
     * Get input files
     */
    files(key) {
        if (!Array.isArray(this.fileInput[key])) {
            return this.fileInput[key] ? [this.fileInput[key]] : [];
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
         */
        this.moved = false;
        /**
         * Flag if uploaded file is currently in process
         */
        this.processing = false;
    }
    /**
     * Get JSON Object
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
     */
    move(destination, fileName) {
        if (this.isMovedOrInProcess()) {
            throw new error_2.Error('File is already moved or in process');
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
/**
 * Start HTTP Server and convert Application instance to a WebApplication instance
 */
function startServer(app) {
    app_1.checkAppConfig(app);
    app.disable('x-powered-by');
    app.disable('strict routing');
    app.enable('case sensitive routing');
    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
    });
    return new Promise((resolve, reject) => {
        app_1.boot(app).then(() => {
            error_1.provideHttpErrorHandler()(app);
            const server = http.createServer(app);
            server.on('error', err => reject(err));
            server.on('listening', () => {
                if (typeof app.server != 'undefined') {
                    throw new error_2.Error('app.server already exists. There might be conflict with expressjs');
                }
                let addr = server.address();
                let bind = typeof addr == 'string' ? `pipe ${addr}` : `port ${addr.port}`;
                console.log(`Listening on ${bind}`);
                app.server = server;
                resolve(app);
            });
            server.listen(app.config.get('app.port'));
        }).catch(err => reject(err));
    });
}
exports.startServer = startServer;
//# sourceMappingURL=http.js.map