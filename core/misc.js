"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash = require("lodash");
const crypto = require("crypto");
const pathlib = require("path");
const error_1 = require("./error");
const _ = lodash;
exports._ = _;
_.replaceAll = function (str, search, replace) {
    return str.replace(new RegExp(_.escapeRegExp(search), 'g'), replace);
};
_.classExtends = function (childClass, parentClass) {
    return typeof childClass == 'function' && childClass.prototype instanceof parentClass;
};
_.require = function (filePath) {
    let content;
    try {
        content = require(filePath);
    }
    catch (err) {
        if (err.code != 'MODULE_NOT_FOUND') {
            throw err;
        }
    }
    return content;
};
_.requireClass = function (path) {
    let exportedModule = require(path);
    if (typeof exportedModule != 'object') {
        throw new error_1.Error(`exports from ${path} must be an object`);
    }
    let classToExport = pathlib.basename(path, '.js');
    if (typeof exportedModule[classToExport] != 'function') {
        throw new error_1.Error(`${classToExport} doesn't exists in ${path}`);
    }
    if (exportedModule[classToExport].prototype.constructor.name != classToExport) {
        throw new error_1.Error(`Class name must be the same with the filename in: ${path}`);
    }
    return exportedModule[classToExport];
};
const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const DEFAULT_PARAMS = /=[^,]+/mg;
const FAT_ARROWS = /=>.*$/mg;
_.getConstructorParamNames = function (fn) {
    let code = fn.toString();
    if (code.indexOf(' constructor(') == -1)
        return [];
    return _.getFunctionParamNames(code);
};
_.getFunctionParamNames = function (codeOrFn) {
    if (typeof codeOrFn == 'function') {
        codeOrFn = codeOrFn.toString();
    }
    codeOrFn = codeOrFn.replace(COMMENTS, '')
        .replace(FAT_ARROWS, '')
        .replace(DEFAULT_PARAMS, '');
    let result = codeOrFn.slice(codeOrFn.indexOf('(') + 1, codeOrFn.indexOf(')'))
        .match(/([^\s,]+)/g);
    return result === null
        ? []
        : result;
};
_.isNone = function (value) {
    return typeof value == 'undefined' || _.isNull(value);
};
_.defaultIfNone = function (value, defaultVal, returnNull = false) {
    if (typeof value == 'undefined') {
        if (returnNull) {
            if (typeof defaultVal != 'undefined') {
                return defaultVal;
            }
            return null;
        }
        else if (typeof defaultVal != 'undefined') {
            return defaultVal;
        }
    }
    return value;
};
_.sleep = function (milliseconds) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve, reject) => {
            setTimeout(() => resolve(), milliseconds);
        });
    });
};
_.checksum = function (str, algorithm = 'md5', encoding = 'hex') {
    return crypto.createHash(algorithm).update(str, 'utf8').digest(encoding);
};
/**
 * Store class
 */
class Store {
    /**
     * Store constructor
     */
    constructor(content = {}) {
        this.content = content;
    }
    /**
     * Get all
     */
    all() {
        return _.clone(this.content);
    }
    /**
     * Merge another Store object
     */
    merge(content) {
        this.content = _.merge(this.content, content.all());
    }
    /**
     * Convert dotted notation key to brackets
     */
    convertToBrackets(key) {
        return `["${key.split('.').join('"]["')}"]`;
    }
    /**
     * Get a value from content
     */
    get(key, defaultVal) {
        let val;
        if (key.indexOf('.') == -1) {
            val = this.content[key];
        }
        else {
            try {
                val = eval(`this.content${this.convertToBrackets(key)}`);
            }
            catch (e) { }
        }
        return _.defaultIfNone(val, defaultVal);
    }
    /**
     * Set a value to store
     */
    set(key, val) {
        this.content[key] = val;
    }
    /**
     * Delete a value by key
     */
    delete(key) {
        delete this.content[key];
    }
    /**
     * Check if value exists by using a key
     */
    has(key) {
        return typeof this.get(key) != 'undefined';
    }
}
exports.Store = Store;
/**
 * Metadata namespace
 */
var Metadata;
(function (Metadata) {
    /**
     * Prefix for all metadata keys registered using Metadata.set
     */
    Metadata.PREFIX = 'exort:';
    /**
     * Define metadata with auto prefix 'exort'
     */
    function set(target, key, value) {
        Reflect.defineMetadata(`${Metadata.PREFIX}${key}`, value, target);
    }
    Metadata.set = set;
    /**
     * Get metadata defined using Metadata.set
     */
    function get(target, key) {
        return Reflect.getMetadata(`${Metadata.PREFIX}${key}`, target);
    }
    Metadata.get = get;
})(Metadata = exports.Metadata || (exports.Metadata = {}));
//# sourceMappingURL=misc.js.map