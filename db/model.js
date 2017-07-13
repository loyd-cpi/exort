"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const misc_1 = require("../core/misc");
const model_1 = require("../core/model");
/**
 * Decorator to exclude fields in toJSON
 */
function Hidden() {
    return (target, propertyKey) => {
        let hiddenFields = misc_1.Metadata.get(target, 'model:hidden');
        if (!Array.isArray(hiddenFields)) {
            hiddenFields = [];
        }
        if (hiddenFields.indexOf(propertyKey) == -1) {
            hiddenFields.push(propertyKey);
        }
        misc_1.Metadata.set(target, 'model:hidden', hiddenFields);
    };
}
exports.Hidden = Hidden;
/**
 * DB Model class
 */
class Model extends model_1.Model {
    /**
     * Get a JSON serializable object
     */
    toJSON(options) {
        let hiddenFields = misc_1.Metadata.get(Object.getPrototypeOf(this), 'model:hidden') || [];
        if (options && Array.isArray(options.hidden) && options.hidden.length) {
            hiddenFields = hiddenFields.concat(options.hidden);
        }
        if (hiddenFields.length) {
            let fields = {};
            for (let propName in this) {
                if (hiddenFields.indexOf(propName) == -1) {
                    fields[propName] = this[propName];
                }
            }
            return fields;
        }
        return this;
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map