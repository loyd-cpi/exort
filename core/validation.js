"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const misc_1 = require("./misc");
const service_1 = require("./service");
const moment = require("moment");
const error_1 = require("./error");
/**
 * Convert field name to field label
 */
function fieldLabelCase(fieldName) {
    return misc_1._.lowerCase(fieldName);
}
/**
 * FormValidationError class
 */
class FormValidationError extends error_1.Error {
    /**
     * FormValidationError constructor
     */
    constructor(fields, message) {
        super(message || 'Invalid form input');
        this.fields = fields;
    }
    /**
     * Get first error message from a particular field
     */
    getFirstMessage(fieldName) {
        if (typeof this.fields[fieldName] == 'undefined' || !this.fields[fieldName].length)
            return;
        return this.fields[fieldName][0].message;
    }
    /**
     * Generate combined error message
     */
    getCompiledMessage(mergeToken = '\n') {
        let message = [];
        for (let fieldName in this.fields) {
            for (let fieldError of this.fields[fieldName]) {
                message.push(fieldError.message);
            }
        }
        return message.join(mergeToken);
    }
    /**
     * toJSON method
     */
    toJSON() {
        let jsonObj = super.toJSON();
        jsonObj.fields = this.fields;
        return jsonObj;
    }
}
exports.FormValidationError = FormValidationError;
/**
 * Rules class
 */
class FieldValidator {
    /**
     * Rules constructor
     */
    constructor(validator, fieldName, fieldLabel) {
        this.validator = validator;
        this.fieldName = fieldName;
        /**
         * Rules to apply
         */
        this.rules = {};
        /**
         * Validation errors occured
         */
        this.errors = [];
        this.fieldLabel = fieldLabel || fieldLabelCase(fieldName);
    }
    /**
     * Email rule
     */
    email(message) {
        this.rules['email'] = {
            name: 'email',
            handle() {
                return this.validator.getValidation().isEmail(this.validator.getInput(this.fieldName));
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.email,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be yes, on, 1, or true. This is useful for validating "Terms of Service" acceptance.
     */
    accepted(message) {
        this.rules['accepted'] = {
            name: 'accepted',
            handle() {
                return this.validator.getValidation().isAccepted(this.validator.getInput(this.fieldName));
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.accepted,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be a value after a given date. The dates will be passed into moment library.
     */
    after(date, message) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        this.rules['after'] = {
            name: 'after',
            handle() {
                return this.validator.getValidation().isAfter(this.validator.getInput(this.fieldName), date);
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.after,
                    attrs: {
                        label: this.fieldLabel,
                        date: date.toString()
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be a valid date according to moment library
     */
    date(message) {
        this.rules['date'] = {
            name: 'date',
            handle() {
                return this.validator.getValidation().isDate(this.validator.getInput(this.fieldName));
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.date,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be present in the input data and not empty.
     */
    required(message) {
        this.rules['required'] = {
            name: 'required',
            goWithUndefined: true,
            handle() {
                return !this.validator.getValidation().isEmpty(this.validator.getInput(this.fieldName));
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.required,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be present and not empty if the anotherfield field is equal to any value.
     */
    requiredIf(otherField, value, message) {
        if (typeof otherField == 'string') {
            otherField = { name: otherField };
        }
        if (!otherField.label) {
            otherField.label = fieldLabelCase(otherField.name);
        }
        this.rules['requiredIf'] = {
            name: 'requiredIf',
            goWithUndefined: true,
            handle() {
                if (this.validator.getInput(otherField.name) === value) {
                    return !this.validator.getValidation().isEmpty(this.validator.getInput(this.fieldName));
                }
                return true;
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.requiredIf,
                    attrs: {
                        label: this.fieldLabel,
                        other: otherField.label,
                        value: this.validator.getInput(otherField.name)
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be present and not empty only if any of the other specified fields are present.
     */
    requiredWith(otherFields, message) {
        let otherFieldNames = [];
        let otherFieldLabels = [];
        if (typeof otherFields == 'string') {
            otherFields = [otherFields];
        }
        for (let field of otherFields) {
            if (typeof field == 'string') {
                otherFieldNames.push(field);
                otherFieldLabels.push(fieldLabelCase(field));
            }
            else {
                otherFieldNames.push(field.name);
                otherFieldLabels.push(field.label || fieldLabelCase(field.name));
            }
        }
        this.rules['requiredWith'] = {
            name: 'requiredWith',
            goWithUndefined: true,
            handle() {
                let validation = this.validator.getValidation();
                for (let otherFieldName of otherFieldNames) {
                    if (!validation.isEmpty(this.validator.getInput(otherFieldName))) {
                        return !validation.isEmpty(this.validator.getInput(this.fieldName));
                    }
                }
                return true;
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.requiredWith,
                    attrs: {
                        label: this.fieldLabel,
                        values: otherFieldLabels.join(', ')
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be present and not empty only if all of the other specified fields are present.
     */
    requiredWithAll(otherFields, message) {
        let otherFieldNames = [];
        let otherFieldLabels = [];
        if (typeof otherFields == 'string') {
            otherFields = [otherFields];
        }
        for (let field of otherFields) {
            if (typeof field == 'string') {
                otherFieldNames.push(field);
                otherFieldLabels.push(fieldLabelCase(field));
            }
            else {
                otherFieldNames.push(field.name);
                otherFieldLabels.push(field.label || fieldLabelCase(field.name));
            }
        }
        this.rules['requiredWithAll'] = {
            name: 'requiredWithAll',
            goWithUndefined: true,
            handle() {
                let checkFieldValue = true;
                let validation = this.validator.getValidation();
                for (let otherFieldName of otherFieldNames) {
                    if (validation.isEmpty(this.validator.getInput(otherFieldName))) {
                        checkFieldValue = false;
                        break;
                    }
                }
                if (checkFieldValue) {
                    return !validation.isEmpty(this.validator.getInput(this.fieldName));
                }
                return true;
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.requiredWithAll,
                    attrs: {
                        label: this.fieldLabel,
                        values: otherFieldLabels.join(', ')
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be included in the given list of values.
     */
    in(list, message) {
        this.rules['in'] = {
            name: 'in',
            handle() {
                return this.validator.getValidation().isValueIn(this.validator.getInput(this.fieldName), list);
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.in,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must not be included in the given list of values.
     */
    notIn(list, message) {
        this.rules['notIn'] = {
            name: 'notIn',
            handle() {
                return !this.validator.getValidation().isValueIn(this.validator.getInput(this.fieldName), list);
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.notIn,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be numeric.
     */
    numeric(message) {
        this.rules['numeric'] = {
            name: 'numeric',
            handle() {
                return this.validator.getValidation().isNumeric(this.validator.getInput(this.fieldName));
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.numeric,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be a string.
     */
    string(message) {
        this.rules['string'] = {
            name: 'string',
            handle() {
                return this.validator.getValidation().isString(this.validator.getInput(this.fieldName));
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.string,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be a value after or equal to the given date. The dates will be passed into moment library.
     */
    afterOrEqual(date, message) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        this.rules['afterOrEqual'] = {
            name: 'afterOrEqual',
            handle() {
                return this.validator.getValidation().isAfterOrEqual(this.validator.getInput(this.fieldName), date);
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.afterOrEqual,
                    attrs: {
                        label: this.fieldLabel,
                        date: date.toString()
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be entirely alphabetic characters.
     */
    alpha(message) {
        this.rules['alpha'] = {
            name: 'alpha',
            handle() {
                return this.validator.getValidation().isAlpha(this.validator.getInput(this.fieldName));
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.alpha,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation may have alpha-numeric characters, as well as dashes and underscores.
     */
    alphaDash(message) {
        this.rules['alphaDash'] = {
            name: 'alphaDash',
            handle() {
                return this.validator.getValidation().isAlphaDash(this.validator.getInput(this.fieldName));
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.alphaDash,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be entirely alpha-numeric characters.
     */
    alphaNum(message) {
        this.rules['alphaNum'] = {
            name: 'alphaNum',
            handle() {
                return this.validator.getValidation().isAlphaNum(this.validator.getInput(this.fieldName));
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.alphaNum,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be a JavasScript array.
     */
    array(message) {
        this.rules['array'] = {
            name: 'array',
            handle() {
                return this.validator.getValidation().isArray(this.validator.getInput(this.fieldName));
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.array,
                    attrs: {
                        label: this.fieldLabel
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be a value preceding the given date. The dates will be passed into moment library.
     */
    before(date, message) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        this.rules['before'] = {
            name: 'before',
            handle() {
                return this.validator.getValidation().isBefore(this.validator.getInput(this.fieldName), date);
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.before,
                    attrs: {
                        label: this.fieldLabel,
                        date: date.toString()
                    }
                };
            }
        };
        return this;
    }
    /**
     * The field under validation must be a value preceding or equal to the given date. The dates will be passed into moment library.
     */
    beforeOrEqual(date, message) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        this.rules['beforeOrEqual'] = {
            name: 'beforeOrEqual',
            handle() {
                return this.validator.getValidation().isBeforeOrEqual(this.validator.getInput(this.fieldName), date);
            },
            message() {
                return {
                    message: message || Validation.RULE_MESSAGES.beforeOrEqual,
                    attrs: {
                        label: this.fieldLabel,
                        date: date.toString()
                    }
                };
            }
        };
        return this;
    }
    /**
     * Add error message
     */
    addError(ruleName, message, attrs) {
        this.errors.push({ rule: ruleName, message: misc_1._.template(message)(attrs || {}) });
    }
    /**
     * Get errors
     */
    getErrors() {
        return this.errors;
    }
    /**
     * Check validation errors is not empty
     */
    hasErrors() {
        return this.errors.length ? true : false;
    }
    /**
     * Validate field and save errors
     */
    check() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.errors = [];
            let valueIsEmpty = this.validator.getValidation().isEmpty(this.validator.getInput(this.fieldName));
            for (let rule in this.rules) {
                if (valueIsEmpty && !this.rules[rule].goWithUndefined) {
                    continue;
                }
                let pass = true;
                if (this.rules[rule].async) {
                    pass = yield this.rules[rule].handle.call(this);
                }
                else {
                    pass = this.rules[rule].handle.call(this);
                }
                if (!pass) {
                    let error = this.rules[rule].message.call(this);
                    this.addError(rule, error.message, error.attrs);
                }
            }
            return this.hasErrors();
        });
    }
}
exports.FieldValidator = FieldValidator;
/**
 * FormValidator class
 */
class FormValidator {
    /**
     * Validator constructor
     */
    constructor(validation, input) {
        this.validation = validation;
        this.input = input;
        /**
         * Map of field validators
         */
        this.fields = {};
        /**
         * Map of validation errors
         */
        this.fieldErrors = {};
    }
    /**
     * Initiate rules for the given field name
     */
    field(fieldName, fieldLabel) {
        if (!this.fields[fieldName]) {
            this.fields[fieldName] = new FieldValidator(this, fieldName, fieldLabel);
        }
        return this.fields[fieldName];
    }
    /**
     * Get validation service instance
     */
    getValidation() {
        return this.validation;
    }
    /**
     * Get a value from input
     */
    getInput(key) {
        return this.input.get(key);
    }
    /**
     * Add input or replace if a key already exists
     */
    addInput(key, value) {
        this.input.set(key, value);
    }
    /**
     * Validate all fields
     */
    validate() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.fieldErrors = {};
            for (let fieldName in this.fields) {
                yield this.fields[fieldName].check();
                if (this.fields[fieldName].hasErrors()) {
                    this.fieldErrors[fieldName] = this.fields[fieldName].getErrors();
                }
            }
            return !this.hasErrors();
        });
    }
    /**
     * Check if form validator has errors
     */
    hasErrors() {
        return Object.keys(this.fieldErrors).length > 0;
    }
    /**
     * Validate and throw error if validation fails
     */
    validateAndThrow() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!(yield this.validate())) {
                throw new FormValidationError(this.getErrors());
            }
        });
    }
    /**
     * Get errors
     */
    getErrors() {
        return this.fieldErrors;
    }
}
exports.FormValidator = FormValidator;
/**
 * Validator class
 */
class Validation extends service_1.Service {
    /**
     * Check if value given is a valid email address
     */
    isEmail(val) {
        return new RegExp(`^(([^<>()[\\]\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\.,;:\\s@\\"]+)*)|(\\".+\\"))` +
            `@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$`).test(val);
    }
    /**
     * Check if value is yes, 1 or true
     */
    isAccepted(val) {
        if (typeof val == 'string') {
            return val.toLowerCase() == 'yes';
        }
        else if (typeof val == 'boolean') {
            return val == true;
        }
        else if (typeof val == 'number') {
            return val == 1;
        }
        return false;
    }
    /**
     * Date validation
     */
    isDate(date) {
        return moment(date).isValid();
    }
    /**
     * Empty check
     */
    isEmpty(val) {
        if (misc_1._.isNone(val)) {
            return true;
        }
        let str = `${val}`.replace(/\s/g, '');
        return str.length > 0 ? false : true;
    }
    /**
     * After date validation
     */
    isAfter(dateToCheck, afterDate) {
        return moment(dateToCheck).isAfter(afterDate);
    }
    /**
     * After or same date validation
     */
    isAfterOrEqual(dateToCheck, afterDate) {
        return moment(dateToCheck).isSameOrAfter(afterDate);
    }
    /**
     * Alphabetic characters validation
     */
    isAlpha(val) {
        return (/^[a-zA-Z]+$/).test(val);
    }
    /**
     * Alpha dash validation
     */
    isAlphaDash(val) {
        return (/^[a-zA-Z0-9_\-]+$/).test(val);
    }
    /**
     * Alpha numeric validation
     */
    isAlphaNum(val) {
        return (/^[a-zA-Z0-9]+$/).test(val);
    }
    /**
     * Array validation
     */
    isArray(val) {
        return Array.isArray(val) && val instanceof Array;
    }
    /**
     * Before date validation
     */
    isBefore(dateToCheck, beforeDate) {
        return moment(dateToCheck).isBefore(beforeDate);
    }
    /**
     * Before or same date validation
     */
    isBeforeOrEqual(dateToCheck, beforeDate) {
        return moment(dateToCheck).isSameOrBefore(beforeDate);
    }
    /**
     * In rule
     */
    isValueIn(val, list) {
        return misc_1._.indexOf(list, val) > -1;
    }
    /**
     * Numeric check
     */
    isNumeric(val) {
        return typeof val != 'boolean' && !isNaN(Number(val));
    }
    /**
     * String check
     */
    isString(val) {
        return misc_1._.isString(val);
    }
    /**
     * Create FormValidator instance
     */
    createForm(input = {}) {
        return new FormValidator(this, new misc_1.Store(input));
    }
}
/**
 * Map of rule messages
 */
Validation.RULE_MESSAGES = {
    accepted: 'The ${label} must be accepted.',
    activeUrl: 'The ${label} is not a valid URL.',
    after: 'The ${label} must be a date after ${date}.',
    afterOrEqual: 'The ${label} must be a date after or equal to ${date}.',
    alpha: 'The ${label} may only contain letters.',
    alphaDash: 'The ${label} may only contain letters, numbers, and dashes.',
    alphaNum: 'The ${label} may only contain letters and numbers.',
    array: 'The ${label} must be an array.',
    before: 'The ${label} must be a date before ${date}.',
    beforeOrEqual: 'The ${label} must be a date before or equal to ${date}.',
    between: {
        numeric: 'The ${label} must be between ${min} and ${max}.',
        file: 'The ${label} must be between ${min} and ${max} kilobytes.',
        string: 'The ${label} must be between ${min} and ${max} characters.',
        array: 'The ${label} must have between ${min} and ${max} items.'
    },
    boolean: 'The ${label} field must be true or false.',
    confirmed: 'The ${label} confirmation does not match.',
    date: 'The ${label} is not a valid date.',
    dateFormat: 'The ${label} does not match the format :format.',
    different: 'The ${label} and ${other} must be different.',
    digits: 'The ${label} must be ${digits} digits.',
    digitsBetween: 'The ${label} must be between ${min} and ${max} digits.',
    dimensions: 'The ${label} has invalid image dimensions.',
    distinct: 'The ${label} field has a duplicate value.',
    email: 'The ${label} must be a valid email address.',
    exists: 'The selected ${label} is invalid.',
    file: 'The ${label} must be a file.',
    filled: 'The ${label} field must have a value.',
    image: 'The ${label} must be an image.',
    in: 'The selected ${label} is invalid.',
    inArray: 'The ${label} field does not exist in ${other}.',
    integer: 'The ${label} must be an integer.',
    ip: 'The ${label} must be a valid IP address.',
    ipv4: 'The ${label} must be a valid IPv4 address.',
    ipv6: 'The ${label} must be a valid IPv6 address.',
    json: 'The ${label} must be a valid JSON string.',
    max: {
        numeric: 'The ${label} may not be greater than ${max}.',
        file: 'The ${label} may not be greater than ${max} kilobytes.',
        string: 'The ${label} may not be greater than ${max} characters.',
        array: 'The ${label} may not have more than ${max} items.'
    },
    mimes: 'The ${label} must be a file of type: ${values}.',
    mimeTypes: 'The ${label} must be a file of type: ${values}.',
    min: {
        numeric: 'The ${label} must be at least ${min}.',
        file: 'The ${label} must be at least ${min} kilobytes.',
        string: 'The ${label} must be at least ${min} characters.',
        array: 'The ${label} must have at least ${min} items.'
    },
    notIn: 'The selected ${label} is invalid.',
    numeric: 'The ${label} must be a number.',
    present: 'The ${label} field must be present.',
    regex: 'The ${label} format is invalid.',
    required: 'The ${label} field is required.',
    requiredIf: 'The ${label} field is required when ${other} is ${value}.',
    requiredUnless: 'The ${label} field is required unless ${other} is in ${values}.',
    requiredWith: 'The ${label} field is required when ${values} is present.',
    requiredWithAll: 'The ${label} field is required when ${values} is present.',
    requiredWithout: 'The ${label} field is required when ${values} is not present.',
    requiredWithoutAll: 'The ${label} field is required when none of ${values} are present.',
    same: 'The ${label} and ${other} must match.',
    size: {
        numeric: 'The ${label} must be ${size}.',
        file: 'The ${label} must be ${size} kilobytes.',
        string: 'The ${label} must be ${size} characters.',
        array: 'The ${label} must contain ${size} items.'
    },
    string: 'The ${label} must be a string.',
    timezone: 'The ${label} must be a valid zone.',
    unique: 'The ${label} has already been taken.',
    uploaded: 'The ${label} failed to upload.',
    url: 'The ${label} format is invalid.',
};
exports.Validation = Validation;
/**
 * Decorator to create a validator for a class method
 */
function Validate() {
    return (target, propertyKey, desc) => {
        if (typeof desc.value != 'function') {
            throw new error_1.Error(`${propertyKey} is not valid for Validate decorator. Must be a function`);
        }
        const originalMethod = desc.value;
        const paramNames = misc_1._.getFunctionParamNames(originalMethod);
        desc.value = function () {
            return tslib_1.__awaiter(this, arguments, void 0, function* () {
                if (arguments.length) {
                    const validation = this.context.make(Validation);
                    const validator = validation.createForm();
                    let args = Array.from(arguments);
                    for (let paramIndex in args) {
                        if (!paramNames[paramIndex])
                            continue;
                        validator.addInput(paramNames[paramIndex], args[paramIndex]);
                        let rules = misc_1.Metadata.get(target, `fieldRules:${propertyKey}:${paramIndex}`);
                        if (typeof rules == 'function') {
                            rules(validator.field(paramNames[paramIndex], misc_1.Metadata.get(target, `fieldLabel:${propertyKey}:${paramIndex}`)));
                        }
                    }
                    yield validator.validateAndThrow();
                }
                return originalMethod.apply(this, arguments);
            });
        };
    };
}
exports.Validate = Validate;
/**
 * Decorator to add validation rules on a parameter
 */
function Field(rules, label) {
    return (target, propertyKey, parameterIndex) => {
        let fnRules = rules;
        if (typeof rules == 'string') {
            fnRules = (field) => field[rules]();
        }
        misc_1.Metadata.set(target, `fieldRules:${propertyKey}:${parameterIndex}`, fnRules);
        if (label) {
            misc_1.Metadata.set(target, `fieldLabel:${propertyKey}:${parameterIndex}`, label);
        }
    };
}
exports.Field = Field;
//# sourceMappingURL=validation.js.map