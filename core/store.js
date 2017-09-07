"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const misc_1 = require("./misc");
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
        return misc_1._.clone(this.content);
    }
    /**
     * Merge another Store object
     */
    merge(content) {
        this.content = misc_1._.merge(this.content, content.all());
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
        return misc_1._.defaultIfNone(val, defaultVal);
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
 * Base input class
 */
class Input extends Store {
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
}
exports.Input = Input;
//# sourceMappingURL=store.js.map