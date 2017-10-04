import { KeyValuePair } from './misc';
import { Service } from './service';
import { File } from './filesystem';
import * as moment from 'moment';
import { Error } from './error';
import { Store } from './store';
/**
 * Rule interface
 */
export interface ValidationRule {
    name: string;
    async?: boolean;
    goWithUndefined?: boolean;
    handle(this: FieldValidator): boolean | Promise<boolean>;
    message(this: FieldValidator): {
        message: string;
        attrs: KeyValuePair<string | number>;
    };
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
     */
    constructor(fields: KeyValuePair<FieldValidationError[]>, message?: string);
    /**
     * Get first error message from a particular field
     */
    getFirstMessage(fieldName: string): string | undefined;
    /**
     * Generate combined error message
     */
    getCompiledMessage(mergeToken?: string): string;
    /**
     * toJSON method
     */
    toJSON(): KeyValuePair<any>;
}
/**
 * Rules class
 */
export declare class FieldValidator {
    private validator;
    readonly fieldName: string;
    /**
     * Rules to apply
     */
    private rules;
    /**
     * Validation errors occured
     */
    private errors;
    /**
     * Field label
     */
    readonly fieldLabel: string;
    /**
     * Rules constructor
     */
    constructor(validator: FormValidator, fieldName: string, fieldLabel?: string);
    /**
     * Email rule
     */
    email(message?: string): this;
    /**
     * The field under validation must be yes, on, 1, or true. This is useful for validating "Terms of Service" acceptance.
     */
    accepted(message?: string): this;
    /**
     * The field under validation must be a value after a given date. The dates will be passed into moment library.
     */
    after(date: moment.MomentInput, message?: string): this;
    /**
     * The field under validation must be a valid date according to moment library
     */
    date(message?: string): this;
    /**
     * The field under validation must be present in the input data and not empty.
     */
    required(message?: string): this;
    /**
     * The field under validation must be present and not empty if the anotherfield field is equal to any value.
     */
    requiredIf(otherField: string, value: any, message?: string): this;
    /**
     * The field under validation must be present and not empty if the anotherfield field is equal to any value.
     */
    requiredIf(otherField: {
        name: string;
        label?: string;
    }, value: any, message?: string): this;
    /**
     * The field under validation must be present and not empty only if any of the other specified fields are present.
     */
    requiredWith(otherFields: string, message?: string): this;
    /**
     * The field under validation must be present and not empty only if any of the other specified fields are present.
     */
    requiredWith(otherFields: string[], message?: string): this;
    /**
     * The field under validation must be present and not empty only if any of the other specified fields are present.
     */
    requiredWith(otherFields: {
        name: string;
        label?: string;
    }[], message?: string): this;
    /**
     * The field under validation must be present and not empty only if all of the other specified fields are present.
     */
    requiredWithAll(otherFields: string, message?: string): this;
    /**
     * The field under validation must be present and not empty only if all of the other specified fields are present.
     */
    requiredWithAll(otherFields: string[], message?: string): this;
    /**
     * The field under validation must be present and not empty only if all of the other specified fields are present.
     */
    requiredWithAll(otherFields: {
        name: string;
        label?: string;
    }[], message?: string): this;
    /**
     * The field under validation must be present and not empty only when any of the other specified fields are not present.
     */
    requiredWithout(otherFields: string, message?: string): this;
    /**
     * The field under validation must be present and not empty only when any of the other specified fields are not present.
     */
    requiredWithout(otherFields: string[], message?: string): this;
    /**
     * The field under validation must be present and not empty only when any of the other specified fields are not present.
     */
    requiredWithout(otherFields: {
        name: string;
        label?: string;
    }[], message?: string): this;
    /**
     * The field under validation must be present and not empty only when all of the other specified fields are not present.
     */
    requiredWithoutAll(otherFields: string, message?: string): this;
    /**
     * The field under validation must be present and not empty only when all of the other specified fields are not present.
     */
    requiredWithoutAll(otherFields: string[], message?: string): this;
    /**
     * The field under validation must be present and not empty only when all of the other specified fields are not present.
     */
    requiredWithoutAll(otherFields: {
        name: string;
        label?: string;
    }[], message?: string): this;
    /**
     * The field under validation must be included in the given list of values.
     */
    in(list: any[], message?: string): this;
    /**
     * The field under validation must not be included in the given list of values.
     */
    notIn(list: (string | number)[], message?: string): this;
    /**
     * The field under validation must be numeric.
     */
    numeric(message?: string): this;
    /**
     * The field under validation must be a string.
     */
    string(message?: string): this;
    /**
     * The field under validation must be a value after or equal to the given date. The dates will be passed into moment library.
     */
    afterOrEqual(date: moment.MomentInput, message?: string): this;
    /**
     * The given field must match the field under validation.
     */
    same(otherField: string, message?: string): this;
    /**
     * The given field must match the field under validation.
     */
    same(otherField: {
        name: string;
        label?: string;
    }, message?: string): this;
    /**
     * The field under validation must be entirely alphabetic characters.
     */
    alpha(message?: string): this;
    /**
     * The field under validation must be entirely alphabetic characters and allows spaces.
     */
    alphaSpace(message?: string): this;
    /**
     * The field under validation may have alpha-numeric characters, as well as dashes and underscores.
     */
    alphaDash(message?: string): this;
    /**
     * The field under validation must be entirely alpha-numeric characters.
     */
    alphaNum(message?: string): this;
    /**
     * The field under validation must be a JavasScript array.
     */
    array(message?: string): this;
    /**
     * The field under validation must be a successfully uploaded file.
     */
    file(message?: string): this;
    /**
     * The file under validation must be an image (jpeg, png, bmp, gif, or svg)
     */
    image(message?: string): this;
    /**
     * The field under validation must be a value preceding the given date. The dates will be passed into moment library.
     */
    before(date: moment.MomentInput, message?: string): this;
    /**
     * The field under validation must be a value preceding or equal to the given date. The dates will be passed into moment library.
     */
    beforeOrEqual(date: moment.MomentInput, message?: string): this;
    /**
     * The field under validation must have a minimum value.
     * Strings, numerics, arrays, and files are evaluated in the same fashion as the size rule.
     */
    min(value: number, message?: string): this;
    /**
     * The field under validation must be less than or equal to a maximum value.
     * Strings, numerics, arrays, and files are evaluated in the same fashion as the size rule.
     */
    max(value: number, message?: string): this;
    /**
     * Get message type
     */
    private getMessageType();
    /**
     * Get input value
     */
    getInput(): any;
    /**
     * Add error message
     */
    addError(ruleName: string, message: string, attrs?: KeyValuePair<string | number>): void;
    /**
     * Get errors
     */
    getErrors(): FieldValidationError[];
    /**
     * Check validation errors is not empty
     */
    hasErrors(): boolean;
    /**
     * Validate field and save errors
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
     */
    private fields;
    /**
     * Map of validation errors
     */
    private fieldErrors;
    /**
     * Validator constructor
     */
    constructor(validation: Validation, input: Store);
    /**
     * Initiate rules for the given field name
     */
    field(fieldName: string, fieldLabel?: string): FieldValidator;
    /**
     * Get validation service instance
     */
    getValidation(): Validation;
    /**
     * Get a value from input
     */
    getInput(key: string): any;
    /**
     * Add input or replace if a key already exists
     */
    addInput(key: string, value: any): void;
    /**
     * Validate all fields
     */
    validate(): Promise<boolean>;
    /**
     * Check if form validator has errors
     */
    hasErrors(): boolean;
    /**
     * Validate and throw error if validation fails
     */
    validateAndThrow(): Promise<void>;
    /**
     * Get errors
     */
    getErrors(): KeyValuePair<FieldValidationError[]>;
}
/**
 * Validator class
 */
export declare class Validation extends Service {
    /**
     * Map of rule messages
     */
    static readonly RULE_MESSAGES: {
        accepted: string;
        activeUrl: string;
        after: string;
        afterOrEqual: string;
        alpha: string;
        alphaSpace: string;
        alphaDash: string;
        alphaNum: string;
        array: string;
        before: string;
        beforeOrEqual: string;
        between: KeyValuePair<string>;
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
        max: KeyValuePair<string>;
        mimes: string;
        mimeTypes: string;
        min: KeyValuePair<string>;
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
        size: KeyValuePair<string>;
        string: string;
        timezone: string;
        unique: string;
        uploaded: string;
        url: string;
    };
    /**
     * Check if value given is a valid file
     */
    isFile(val: any): boolean;
    /**
     * Check if value given is an image
     */
    isImage(val: any): boolean;
    /**
     * Check if value given is a valid email address
     */
    isEmail(val: string): boolean;
    /**
     * Check if value is yes, 1 or true
     */
    isAccepted(val: string | boolean | number): boolean;
    /**
     * Get number of value of numeric or get size if value is a string, file or array.
     */
    private getValueOrSize(value);
    /**
     * Check if first parameter is greater than second parameter
     */
    isGreaterThan(val: string | number | File | any[], compareValue: number): boolean;
    /**
     * Check if first parameter is greater than or equal to second parameter
     */
    isGreaterThanOrEqual(val: string | number | File | any[], compareValue: number): boolean;
    /**
     * Check if first parameter is less than second parameter
     */
    isLessThan(val: string | number | File | any[], compareValue: number): boolean;
    /**
     * Check if first parameter is less than or equal to second parameter
     */
    isLessThanOrEqual(val: string | number | File | any[], compareValue: number): boolean;
    /**
     * Check if first parameter is equal to second parameter
     */
    isEqual(val: string | number | File | any[], compareValue: number): boolean;
    /**
     * Date validation
     */
    isDate(date: moment.MomentInput): boolean;
    /**
     * Empty check
     */
    isEmpty(val: any): boolean;
    /**
     * After date validation
     */
    isAfter(dateToCheck: moment.MomentInput, afterDate: moment.MomentInput): boolean;
    /**
     * After or same date validation
     */
    isAfterOrEqual(dateToCheck: moment.MomentInput, afterDate: moment.MomentInput): boolean;
    /**
     * Check if two values are the same
     */
    isSame(firstVal: any, secondVal: any): boolean;
    /**
     * Alphabetic characters validation
     */
    isAlpha(val: string): boolean;
    /**
     * Alphabetic characters with space validation
     */
    isAlphaSpace(val: string): boolean;
    /**
     * Alpha dash validation
     */
    isAlphaDash(val: string): boolean;
    /**
     * Alpha numeric validation
     */
    isAlphaNum(val: string): boolean;
    /**
     * Array validation
     */
    isArray(val: any): boolean;
    /**
     * Before date validation
     */
    isBefore(dateToCheck: moment.MomentInput, beforeDate: moment.MomentInput): boolean;
    /**
     * Before or same date validation
     */
    isBeforeOrEqual(dateToCheck: moment.MomentInput, beforeDate: moment.MomentInput): boolean;
    /**
     * In rule
     */
    isValueIn(val: any, list: any[]): boolean;
    /**
     * Numeric check
     */
    isNumeric(val: any): boolean;
    /**
     * String check
     */
    isString(val: any): boolean;
    /**
     * Create FormValidator instance
     */
    createForm(input?: KeyValuePair): FormValidator;
}
/**
 * Decorator to create a validator for a class method
 */
export declare function Validate(): (target: Object, propertyKey: string, desc: PropertyDescriptor) => void;
/**
 * FieldRule interface
 */
export interface FieldRule {
    (field: FieldValidator): void;
}
/**
 * Decorator to add validation rules on a parameter
 */
export declare function Field(rules: (string | FieldRule)[], label?: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
/**
 * Decorator to add validation rules on a parameter
 */
export declare function Field(rule: string, label?: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
/**
 * Decorator to add validation rules on a parameter
 */
export declare function Field(rules: FieldRule, label?: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
