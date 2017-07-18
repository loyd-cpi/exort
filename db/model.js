"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../core/model");
const misc_1 = require("../core/misc");
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
        let fields = misc_1._.clone(this);
        let hiddenFields = misc_1.Metadata.get(Object.getPrototypeOf(this), 'model:hidden') || [];
        if (options && Array.isArray(options.hidden) && options.hidden.length) {
            hiddenFields = hiddenFields.concat(options.hidden);
        }
        if (hiddenFields.length) {
            for (let propName in fields) {
                if (hiddenFields.indexOf(propName) != -1) {
                    delete fields[propName];
                }
            }
        }
        return fields;
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map