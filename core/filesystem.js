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
const mime_1 = require("./mime");
const pathlib = require("path");
const misc_1 = require("./misc");
const fs = require("fs");
/**
 * File class
 */
class File {
    /**
     * File constructor
     */
    constructor(info) {
        this.name = info.name;
        this.path = info.path;
        this.size = info.size;
        this.hash = info.hash;
        this.type = info.type;
        this.lastModifiedDate = info.lastModifiedDate;
    }
    /**
     * Guess file extension using mime type
     */
    guessExtension() {
        return mime_1.MIME_TYPE_EXTENSIONS.get(this.type);
    }
    /**
     * Create file
     */
    static create(path, content, mimeType, hash) {
        return new Promise((resolve, reject) => {
            path = pathlib.resolve(path);
            if (!hash) {
                hash = misc_1._.checksum(content, 'sha1');
            }
            if (!pathlib.extname(path) && mimeType && mime_1.MIME_TYPE_EXTENSIONS.has(mimeType)) {
                path = `${path}.${mime_1.MIME_TYPE_EXTENSIONS.get(mimeType)}`;
            }
            fs.writeFile(path, content, err => {
                if (err)
                    return reject(err);
                resolve(new File({
                    name: pathlib.basename(path),
                    path,
                    hash,
                    type: mimeType,
                    size: content.length,
                    lastModifiedDate: new Date()
                }));
            });
        });
    }
    /**
     * Append content to file
     */
    static append(path, content) {
        return new Promise((resolve, reject) => {
            fs.appendFile(path, content, err => {
                if (err)
                    return reject(err);
                resolve(true);
            });
        });
    }
    /**
     * Read directory
     */
    static readDirectory(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err)
                    return reject(err);
                resolve(files);
            });
        });
    }
    /**
     * Get file or directory stats
     */
    static getStats(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err)
                    return reject(err);
                resolve(stats);
            });
        });
    }
    /**
     * Check if file exists
     */
    static exists(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.getStats(path);
            }
            catch (ex) {
                if (ex.code == 'ENOENT') {
                    return false;
                }
                throw ex;
            }
            return true;
        });
    }
    /**
     * Read content from file
     */
    static read(path, options) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, options || {}, (err, content) => {
                if (err)
                    return reject(err);
                resolve(content.toString());
            });
        });
    }
    /**
     * Create file from base64 string
     */
    static createFromBase64String(base64String, mimeType, path, name) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileBuffer = Buffer.from(base64String, 'base64');
            let hash = misc_1._.checksum(fileBuffer, 'sha1');
            if (!name) {
                name = hash;
            }
            return yield File.create(pathlib.join(path, name), fileBuffer, mimeType, hash);
        });
    }
}
exports.File = File;
//# sourceMappingURL=filesystem.js.map