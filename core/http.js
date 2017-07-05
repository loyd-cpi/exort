"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const misc_1 = require("./misc");
const formidable = require("formidable");
const filesystem_1 = require("./filesystem");
const pathlib = require("path");
const bytes = require("bytes");
const http = require("http");
const os = require("os");
const fs = require("fs");
const STATUSES = require('statuses');
const qs = require('qs');
/**
 * Install body parser
 */
function provideBodyParser() {
    return (app) => __awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        let requestConf = app.config.get('request') || {};
        requestConf.encoding = requestConf.encoding || 'utf-8';
        requestConf.postMaxSize = requestConf.postMaxSize || '2MB';
        requestConf.uploadMaxSize = requestConf.uploadMaxSize || '5MB';
        requestConf.tmpUploadDir = requestConf.tmpUploadDir || os.tmpdir();
        if (!pathlib.isAbsolute(requestConf.tmpUploadDir)) {
            requestConf.tmpUploadDir = pathlib.join(app.dir, requestConf.tmpUploadDir);
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
        if (!this.fileInput || !this.fileInput[key])
            return;
        if (Array.isArray(this.fileInput[key])) {
            return this.fileInput[key][0];
        }
        return this.fileInput[key];
    }
    /**
     * Get input files
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
 * Start HTTP Server
 */
function startServer(app, providers) {
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
        app_1.executeProviders(app, providers)
            .then(() => {
            let server = http.createServer(app);
            server.on('error', err => reject(err));
            server.on('listening', () => {
                let addr = server.address();
                let bind = typeof addr == 'string' ? `pipe ${addr}` : `port ${addr.port}`;
                console.log(`Listening on ${bind}`);
                resolve(app);
            });
            server.listen(app.config.get('app.port'));
        })
            .catch(err => reject(err));
    });
}
exports.startServer = startServer;
/**
 * HttpError class
 */
class HttpError extends Error {
    /**
     * HttpError constructor
     */
    constructor(statusCode, message) {
        super(message || STATUSES[statusCode]);
        this.statusCode = statusCode;
        if (statusCode < 400) {
            throw new Error('HttpError only accepts status codes greater than 400');
        }
        if (!STATUSES[statusCode]) {
            throw new Error('HttpError invalid status code');
        }
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=http.js.map