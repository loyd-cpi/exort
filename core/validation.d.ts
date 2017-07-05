import { Service } from './service';
import { KeyValuePair } from './misc';
import * as moment from 'moment';
/**
 * Rule interface
 */
export interface ValidationRule {
    name: string;
    async?: boolean;
    handle(this: FieldValidator): boolean | Promise<boolean>;
    message: string;
    attrs: KeyValuePair<string | number>;
}
/**
 * FieldValidationError interface
 */
export interface FieldValidationError {
    rule: string;
    message: string;
}
/**
 * FormValidationError class
 */
export declare class FormValidationError extends Error {
    readonly fields: KeyValuePair<FieldValidationError[]>;
    /**
     * FormValidationError constructor
     * @param {KeyValuePair<FieldValidationError[]>} fields
     * @param {string} message
     */
    constructor(fields: KeyValuePair<FieldValidationError[]>, message?: string);
    /**
     * Get first error message from a particular field
     * @param  {string} fieldName
     * @return {string | undefined}
     */
    getFirstMessage(fieldName: string): string | undefined;
    /**
     * Generate combined error message
     * @param  {string} mergeToken
     * @return {string}
     */
    getCompiledMessage(mergeToken?: string): string;
}
/**
 * Rules class
 */
export declare class FieldValidator {
    private validator;
    readonly fieldName: string;
    /**
     * Rules to apply
     * @type {KeyValuePair<ValidationRule>}
     */
    private rules;
    /**
     * Validation errors occured
     * @type {FieldValidationError[]}
     */
    private errors;
    /**
     * Field label
     * @type {string}
     */
    readonly fieldLabel: string;
    /**
     * Rules constructor
     * @param {FormValidator} validator
     * @param {string} fieldName
     * @param {string} fieldLabel
     */
    constructor(validator: FormValidator, fieldName: string, fieldLabel?: string);
    /**
     * Email rule
     * @return {this}
     */
    email(message?: string): this;
    /**
     * The field under validation must be yes, on, 1, or true. This is useful for validating "Terms of Service" acceptance.
     * @param  {string} message
     * @return {this}
     */
    accepted(message?: string): this;
    /**
     * The field under validation must be a value after a given date. The dates will be passed into moment library.
     * @param  {moment.MomentInput} date
     * @param  {string} message
     * @return {this}
     */
    after(date: moment.MomentInput, message?: string): this;
    /**
     * The field under validation must be a valid date according to moment library
     * @param  {string} message
     * @return {this}
     */
    date(message?: string): this;
    /**
     * The field under validation must be present in the input data and not empty.
     * @param  {string} message
     * @return {this}
     */
    required(message?: string): this;
    /**
     * The field under validation must be a value after or equal to the given date. The dates will be passed into moment library.
     * @param  {moment.MomentInput} date
     * @param  {string} message
     * @return {this}
     */
    afterOrEqual(date: moment.MomentInput, message?: string): this;
    /**
     * The field under validation must be entirely alphabetic characters.
     * @param  {string} message
     * @return {this}
     */
    alpha(message?: string): this;
    /**
     * The field under validation may have alpha-numeric characters, as well as dashes and underscores.
     * @param  {string} message
     * @return {this}
     */
    alphaDash(message?: string): this;
    /**
     * The field under validation must be entirely alpha-numeric characters.
     * @param  {string} message
     * @return {this}
     */
    alphaNum(message?: string): this;
    /**
     * The field under validation must be a JavasScript array.
     * @param  {string} message
     * @return {this}
     */
    array(message?: string): this;
    /**
     * The field under validation must be a value preceding the given date. The dates will be passed into moment library.
     * @param  {moment.MomentInput} date
     * @param  {string} message
     * @return {this}
     */
    before(date: moment.MomentInput, message?: string): this;
    /**
     * The field under validation must be a value preceding or equal to the given date. The dates will be passed into moment library.
     * @param  {moment.MomentInput} date
     * @param  {string} message
     * @return {this}
     */
    beforeOrEqual(date: moment.MomentInput, message?: string): this;
    /**
     * Add error message
     * @param  {string} ruleName
     * @param  {string} message
     * @param  {KeyValuePair<string | number>} attrs
     * @return {void}
     */
    addError(ruleName: string, message: string, attrs?: KeyValuePair<string | number>): void;
    /**
     * Get errors
     * @return {FieldValidationError[]}
     */
    getErrors(): FieldValidationError[];
    /**
     * Check validation errors is not empty
     * @return {boolean}
     */
    hasErrors(): boolean;
    /**
     * Validate field and save errors
     * @return {boolean}
     */
    check(): Promise<boolean>;
}
/**
 * FormValidator class
 */
export declare class FormValidator {
    private validation;
    private input;
    /**
     * Map of field validators
     * @type {KeyValuePair<FieldValidator>}
     */
    private fields;
    /**
     * Map of validation errors
     * @type {KeyValuePair<FieldValidationError[]>}
     */
    private fieldErrors;
    /**
     * Validator constructor
     * @param {Validation} context
     * @param {KeyValuePair<any>} input
     */
    constructor(validation: Validation, input?: KeyValuePair<any>);
    /**
     * Initiate rules for the given field name
     * @param  {string} fieldName
     * @param  {string} fieldLabel
     * @return {FieldValidator}
     */
    field(fieldName: string, fieldLabel?: string): FieldValidator;
    /**
     * Get validation service instance
     * @return {Validation}
     */
    getValidation(): Validation;
    /**
     * Get a value from input
     * @param  {string} key
     * @return {any}
     */
    getInput(key: string): any;
    /**
     * Validate all fields
     * @return {Promise<boolean>}
     */
    validate(): Promise<boolean>;
    /**
     * Check if form validator has errors
     * @return {boolean}
     */
    hasErrors(): boolean;
    /**
     * Validate and throw error if validation fails
     * @return {Promise<void>}
     */
    validateAndThrow(): Promise<void>;
    /**
     * Get errors
     * @return {KeyValuePair<FieldValidationError[]>}
     */
    getErrors(): KeyValuePair<FieldValidationError[]>;
}
/**
 * Validator class
 */
export declare class Validation extends Service {
    /**
     * Map of rule messages
     * @type {Object}
     */
    static readonly RULE_MESSAGES: {
        accepted: string;
        activeUrl: string;
        after: string;
        afterOrEqual: string;
        alpha: string;
        alphaDash: string;
        alphaNum: string;
        array: string;
        before: string;
        beforeOrEqual: string;
        between: {
            numeric: string;
            file: string;
            string: string;
            array: string;
        };
        boolean: string;
        confirmed: string;
        date: string;
        dateFormat: string;
        different: string;
        digits: string;
        digitsBetween: string;
        dimensions: string;
        distinct: string;
        email: string;
        exists: string;
        file: string;
        filled: string;
        image: string;
        in: string;
        inArray: string;
        integer: string;
        ip: string;
        ipv4: string;
        ipv6: string;
        json: string;
        max: {
            numeric: string;
            file: string;
            string: string;
            array: string;
        };
        mimes: string;
        mimeTypes: string;
        min: {
            numeric: string;
            file: string;
            string: string;
            array: string;
        };
        notIn: string;
        numeric: string;
        present: string;
        regex: string;
        required: string;
        requiredIf: string;
        requiredUnless: string;
        requiredWith: string;
        requiredWithAll: string;
        requiredWithout: string;
        requiredWithoutAll: string;
        same: string;
        size: {
            numeric: string;
            file: string;
            string: string;
            array: string;
        };
        string: string;
        timezone: string;
        unique: string;
        uploaded: string;
        url: string;
    };
    /**
     * Check if value given is a valid email address
     * @param  {string} val
     * @return {boolean}
     */
    isEmail(val: string): boolean;
    /**
     * Check if value is yes, 1 or true
     * @param  {boolean | string | number} val
     * @return {boolean}
     */
    isAccepted(val: string | boolean | number): boolean;
    /**
     * Date validation
     * @param  {moment.MomentInput} date
     * @return {boolean}
     */
    isDate(date: moment.MomentInput): boolean;
    /**
     * Empty check
     * @param  {any} val
     * @return {boolean}
     */
    isEmpty(val: any): boolean;
    /**
     * After date validation
     * @param  {moment.MomentInput} dateToCheck
     * @param  {moment.MomentInput} afterDate
     * @return {boolean}
     */
    isAfter(dateToCheck: moment.MomentInput, afterDate: moment.MomentInput): boolean;
    /**
     * After or same date validation
     * @param  {moment.MomentInput} dateToCheck
     * @param  {moment.MomentInput} afterDate
     * @return {boolean}
     */
    isAfterOrEqual(dateToCheck: moment.MomentInput, afterDate: moment.MomentInput): boolean;
    /**
     * Alphabetic characters validation
     * @param  {string} val
     * @return {boolean}
     */
    isAlpha(val: string): boolean;
    /**
     * Alpha dash validation
     * @param  {string} val
     * @return {boolean}
     */
    isAlphaDash(val: string): boolean;
    /**
     * Alpha numeric validation
     * @param  {string} val
     * @return {boolean}
     */
    isAlphaNum(val: string): boolean;
    /**
     * Array validation
     * @param  {any} val
     * @return {boolean}
     */
    isArray(val: any): boolean;
    /**
     * Before date validation
     * @param  {moment.MomentInput} dateToCheck
     * @param  {moment.MomentInput} beforeDate
     * @return {boolean}
     */
    isBefore(dateToCheck: moment.MomentInput, beforeDate: moment.MomentInput): boolean;
    /**
     * Before or same date validation
     * @param  {moment.MomentInput} dateToCheck
     * @param  {moment.MomentInput} beforeDate
     * @return {boolean}
     */
    isBeforeOrEqual(dateToCheck: moment.MomentInput, beforeDate: moment.MomentInput): boolean;
    /**
     * Create FormValidator instance
     * @param  {KeyValuePair<any>} input
     * @return {FormValidator}
     */
    createForm(input: KeyValuePair<any>): FormValidator;
}
