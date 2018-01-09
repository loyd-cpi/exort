import { KeyValuePair, Metadata, _ } from './misc';
import { Service } from './handler';
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
  message(this: FieldValidator): { message: string, attrs: KeyValuePair<string | number> };
}

/**
 * FieldValidationError interface
 */
export interface FieldValidationError {
  rule: string;
  message: string;
}

/**
 * Convert field name to field label
 */
function fieldLabelCase(fieldName: string): string {
  return _.lowerCase(fieldName);
}

/**
 * FormValidationError class
 */
export class FormValidationError extends Error {

  /**
   * FormValidationError constructor
   */
  constructor(public readonly fields: KeyValuePair<FieldValidationError[]>, message?: string) {
    super(message || 'Invalid form input');
  }

  /**
   * Get first error message from a particular field
   */
  public getFirstMessage(fieldName: string): string | undefined {
    if (typeof this.fields[fieldName] == 'undefined' || !this.fields[fieldName].length) return;
    return this.fields[fieldName][0].message;
  }

  /**
   * Generate combined error message
   */
  public getCompiledMessage(mergeToken: string = '\n'): string {
    let message: string[] = [];
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
  public toJSON() {
    let jsonObj = super.toJSON();
    jsonObj.fields = this.fields;
    return jsonObj;
  }
}

/**
 * Rules class
 */
export class FieldValidator {

  /**
   * Rules to apply
   */
  private rules: KeyValuePair<ValidationRule> = {};

  /**
   * Validation errors occured
   */
  private errors: FieldValidationError[] = [];

  /**
   * Field label
   */
  public readonly fieldLabel: string;

  /**
   * Rules constructor
   */
  constructor(private validator: FormValidator, public readonly fieldName: string, fieldLabel?: string) {
    this.fieldLabel = fieldLabel || fieldLabelCase(fieldName);
  }

  /**
   * Email rule
   */
  public email(message?: string): this {
    this.rules['email'] = {
      name: 'email',
      handle() {
        return this.validator.getValidation().isEmail(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('email'),
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
  public accepted(message?: string): this {
    this.rules['accepted'] = {
      name: 'accepted',
      handle() {
        return this.validator.getValidation().isAccepted(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('accepted'),
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
  public after(date: moment.MomentInput, message?: string): this {
    if (!moment.isMoment(date)) {
      date = moment(date);
    }
    this.rules['after'] = {
      name: 'after',
      handle() {
        return this.validator.getValidation().isAfter(this.getInput(), date);
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('after'),
          attrs: {
            label: this.fieldLabel,
            date: (date as moment.Moment).toString()
          }
        };
      }
    };
    return this;
  }

  /**
   * The field under validation must be a valid date according to moment library
   */
  public date(message?: string): this {
    this.rules['date'] = {
      name: 'date',
      handle() {
        return this.validator.getValidation().isDate(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('date'),
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
  public required(message?: string): this {
    this.rules['required'] = {
      name: 'required',
      goWithUndefined: true,
      handle() {
        return !this.validator.getValidation().isEmpty(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('required'),
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
  public requiredIf(otherField: string, value: any, message?: string): this;

  /**
   * The field under validation must be present and not empty if the anotherfield field is equal to any value.
   */
  public requiredIf(otherField: { name: string, label?: string }, value: any, message?: string): this;

  /**
   * The field under validation must be present and not empty if the anotherfield field is equal to any value.
   */
  public requiredIf(otherField: { name: string, label?: string } | string, value: any, message?: string): this {
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
        if (this.validator.getInput((otherField as any).name) === value) {
          return !this.validator.getValidation().isEmpty(this.getInput());
        }
        return true;
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('requiredIf'),
          attrs: {
            label: this.fieldLabel,
            other: (otherField as any).label,
            value: this.validator.getInput((otherField as any).name)
          }
        };
      }
    };
    return this;
  }

  /**
   * The field under validation must be present and not empty only if any of the other specified fields are present.
   */
  public requiredWith(otherFields: string, message?: string): this;

  /**
   * The field under validation must be present and not empty only if any of the other specified fields are present.
   */
  public requiredWith(otherFields: string[], message?: string): this;

  /**
   * The field under validation must be present and not empty only if any of the other specified fields are present.
   */
  public requiredWith(otherFields: { name: string, label?: string}[], message?: string): this;

  /**
   * The field under validation must be present and not empty only if any of the other specified fields are present.
   */
  public requiredWith(otherFields: ({ name: string, label?: string} | string)[] | string, message?: string): this {
    let otherFieldNames: string[] = [];
    let otherFieldLabels: string[] = [];
    if (typeof otherFields == 'string') {
      otherFields = [otherFields];
    }

    for (let field of otherFields) {
      if (typeof field == 'string') {
        otherFieldNames.push(field);
        otherFieldLabels.push(fieldLabelCase(field));
      } else {
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
            return !validation.isEmpty(this.getInput());
          }
        }

        return true;
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('requiredWith'),
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
  public requiredWithAll(otherFields: string, message?: string): this;

  /**
   * The field under validation must be present and not empty only if all of the other specified fields are present.
   */
  public requiredWithAll(otherFields: string[], message?: string): this;

  /**
   * The field under validation must be present and not empty only if all of the other specified fields are present.
   */
  public requiredWithAll(otherFields: { name: string, label?: string }[], message?: string): this;

  /**
   * The field under validation must be present and not empty only if all of the other specified fields are present.
   */
  public requiredWithAll(otherFields: ({ name: string, label?: string } | string)[] | string, message?: string): this {
    let otherFieldNames: string[] = [];
    let otherFieldLabels: string[] = [];
    if (typeof otherFields == 'string') {
      otherFields = [otherFields];
    }

    for (let field of otherFields) {
      if (typeof field == 'string') {
        otherFieldNames.push(field);
        otherFieldLabels.push(fieldLabelCase(field));
      } else {
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
          return !validation.isEmpty(this.getInput());
        }

        return true;
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('requiredWithAll'),
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
   * The field under validation must be present and not empty only when any of the other specified fields are not present.
   */
  public requiredWithout(otherFields: string, message?: string): this;

  /**
   * The field under validation must be present and not empty only when any of the other specified fields are not present.
   */
  public requiredWithout(otherFields: string[], message?: string): this;

  /**
   * The field under validation must be present and not empty only when any of the other specified fields are not present.
   */
  public requiredWithout(otherFields: { name: string, label?: string}[], message?: string): this;

  /**
   * The field under validation must be present and not empty only when any of the other specified fields are not present.
   */
  public requiredWithout(otherFields: ({ name: string, label?: string} | string)[] | string, message?: string): this {
    let otherFieldNames: string[] = [];
    let otherFieldLabels: string[] = [];
    if (typeof otherFields == 'string') {
      otherFields = [otherFields];
    }

    for (let field of otherFields) {
      if (typeof field == 'string') {
        otherFieldNames.push(field);
        otherFieldLabels.push(fieldLabelCase(field));
      } else {
        otherFieldNames.push(field.name);
        otherFieldLabels.push(field.label || fieldLabelCase(field.name));
      }
    }

    this.rules['requiredWithout'] = {
      name: 'requiredWithout',
      goWithUndefined: true,
      handle() {

        let validation = this.validator.getValidation();
        for (let otherFieldName of otherFieldNames) {
          if (validation.isEmpty(this.validator.getInput(otherFieldName))) {
            return !validation.isEmpty(this.getInput());
          }
        }

        return true;
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('requiredWithout'),
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
   * The field under validation must be present and not empty only when all of the other specified fields are not present.
   */
  public requiredWithoutAll(otherFields: string, message?: string): this;

  /**
   * The field under validation must be present and not empty only when all of the other specified fields are not present.
   */
  public requiredWithoutAll(otherFields: string[], message?: string): this;

  /**
   * The field under validation must be present and not empty only when all of the other specified fields are not present.
   */
  public requiredWithoutAll(otherFields: { name: string, label?: string }[], message?: string): this;

  /**
   * The field under validation must be present and not empty only when all of the other specified fields are not present.
   */
  public requiredWithoutAll(otherFields: ({ name: string, label?: string } | string)[] | string, message?: string): this {
    let otherFieldNames: string[] = [];
    let otherFieldLabels: string[] = [];
    if (typeof otherFields == 'string') {
      otherFields = [otherFields];
    }

    for (let field of otherFields) {
      if (typeof field == 'string') {
        otherFieldNames.push(field);
        otherFieldLabels.push(fieldLabelCase(field));
      } else {
        otherFieldNames.push(field.name);
        otherFieldLabels.push(field.label || fieldLabelCase(field.name));
      }
    }

    this.rules['requiredWithoutAll'] = {
      name: 'requiredWithoutAll',
      goWithUndefined: true,
      handle() {

        let checkFieldValue = true;
        let validation = this.validator.getValidation();
        for (let otherFieldName of otherFieldNames) {
          if (!validation.isEmpty(this.validator.getInput(otherFieldName))) {
            checkFieldValue = false;
            break;
          }
        }

        if (checkFieldValue) {
          return !validation.isEmpty(this.getInput());
        }

        return true;
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('requiredWithoutAll'),
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
  public in(list: any[], message?: string): this {
    this.rules['in'] = {
      name: 'in',
      handle() {
        return this.validator.getValidation().isValueIn(this.getInput(), list);
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('in'),
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
  public notIn(list: (string | number)[], message?: string): this {
    this.rules['notIn'] = {
      name: 'notIn',
      handle() {
        return !this.validator.getValidation().isValueIn(this.getInput(), list);
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('notIn'),
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
  public numeric(message?: string): this {
    this.rules['numeric'] = {
      name: 'numeric',
      handle() {
        return this.validator.getValidation().isNumeric(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('numeric'),
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
  public string(message?: string): this {
    this.rules['string'] = {
      name: 'string',
      handle() {
        return this.validator.getValidation().isString(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('string'),
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
  public afterOrEqual(date: moment.MomentInput, message?: string): this {
    if (!moment.isMoment(date)) {
      date = moment(date);
    }
    this.rules['afterOrEqual'] = {
      name: 'afterOrEqual',
      handle() {
        return this.validator.getValidation().isAfterOrEqual(this.getInput(), date);
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('afterOrEqual'),
          attrs: {
            label: this.fieldLabel,
            date: (date as moment.Moment).toString()
          }
        };
      }
    };
    return this;
  }

  /**
   * The given field must match the field under validation.
   */
  public same(otherField: string, message?: string): this;

  /**
   * The given field must match the field under validation.
   */
  public same(otherField: { name: string, label?: string }, message?: string): this;

  /**
   * The given field must match the field under validation.
   */
  public same(otherField: string | { name: string, label?: string }, message?: string): this {
    let otherFieldName: string;
    let otherFieldLabel: string;
    if (typeof otherField == 'string') {
      otherFieldName = otherField;
      otherFieldLabel = fieldLabelCase(otherField);
    } else {
      otherFieldName = otherField.name;
      otherFieldLabel = otherField.label || fieldLabelCase(otherField.name);
    }

    this.rules['same'] = {
      name: 'same',
      handle() {
        return this.validator.getValidation().isSame(this.getInput(), this.validator.getInput(otherFieldName));
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('same'),
          attrs: {
            label: this.fieldLabel,
            other: otherFieldLabel
          }
        };
      }
    };
    return this;
  }

  /**
   * The field under validation must be entirely alphabetic characters.
   */
  public alpha(message?: string): this {
    this.rules['alpha'] = {
      name: 'alpha',
      handle() {
        return this.validator.getValidation().isAlpha(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('alpha'),
          attrs: {
            label: this.fieldLabel
          }
        };
      }
    };
    return this;
  }

  /**
   * The field under validation must be entirely alphabetic characters and allows spaces.
   */
  public alphaSpace(message?: string): this {
    this.rules['alphaSpace'] = {
      name: 'alphaSpace',
      handle() {
        return this.validator.getValidation().isAlphaSpace(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('alphaSpace'),
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
  public alphaDash(message?: string): this {
    this.rules['alphaDash'] = {
      name: 'alphaDash',
      handle() {
        return this.validator.getValidation().isAlphaDash(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('alphaDash'),
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
  public alphaNum(message?: string): this {
    this.rules['alphaNum'] = {
      name: 'alphaNum',
      handle() {
        return this.validator.getValidation().isAlphaNum(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('alphaNum'),
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
  public array(message?: string): this {
    this.rules['array'] = {
      name: 'array',
      handle() {
        return this.validator.getValidation().isArray(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('array'),
          attrs: {
            label: this.fieldLabel
          }
        };
      }
    };
    return this;
  }

  /**
   * The field under validation must be a successfully uploaded file.
   */
  public file(message?: string): this {
    this.rules['file'] = {
      name: 'file',
      handle() {
        return this.validator.getValidation().isFile(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('file'),
          attrs: {
            label: this.fieldLabel
          }
        };
      }
    };
    return this;
  }

  /**
   * The file under validation must be an image (jpeg, png, bmp, gif, or svg)
   */
  public image(message?: string): this {
    this.rules['image'] = {
      name: 'image',
      handle() {
        return this.validator.getValidation().isImage(this.getInput());
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('image'),
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
  public before(date: moment.MomentInput, message?: string): this {
    if (!moment.isMoment(date)) {
      date = moment(date);
    }
    this.rules['before'] = {
      name: 'before',
      handle() {
        return this.validator.getValidation().isBefore(this.getInput(), date);
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('before'),
          attrs: {
            label: this.fieldLabel,
            date: (date as moment.Moment).toString()
          }
        };
      }
    };
    return this;
  }

  /**
   * The field under validation must be a value preceding or equal to the given date. The dates will be passed into moment library.
   */
  public beforeOrEqual(date: moment.MomentInput, message?: string): this {
    if (!moment.isMoment(date)) {
      date = moment(date);
    }
    this.rules['beforeOrEqual'] = {
      name: 'beforeOrEqual',
      handle() {
        return this.validator.getValidation().isBeforeOrEqual(this.getInput(), date);
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate('beforeOrEqual'),
          attrs: {
            label: this.fieldLabel,
            date: (date as moment.Moment).toString()
          }
        };
      }
    };
    return this;
  }

  /**
   * The field under validation must have a minimum value.
   * Strings, numerics, arrays, and files are evaluated in the same fashion as the size rule.
   */
  public min(value: number, message?: string): this {
    this.rules['min'] = {
      name: 'min',
      handle() {
        return this.validator.getValidation().isGreaterThanOrEqual(this.getInput(), value);
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate(`min.${this.getMessageType()}`),
          attrs: {
            label: this.fieldLabel,
            min: value
          }
        };
      }
    };
    return this;
  }

  /**
   * The field under validation must be less than or equal to a maximum value.
   * Strings, numerics, arrays, and files are evaluated in the same fashion as the size rule.
   */
  public max(value: number, message?: string): this {
    this.rules['max'] = {
      name: 'max',
      handle() {
        return this.validator.getValidation().isLessThanOrEqual(this.getInput(), value);
      },
      message() {
        return {
          message: message || this.validator.getErrorTemplate(`max.${this.getMessageType()}`),
          attrs: {
            label: this.fieldLabel,
            max: value
          }
        };
      }
    };
    return this;
  }

  /**
   * Get message type
   */
  private getMessageType(): string {
    let value = this.getInput();
    if (value instanceof File) {
      return 'file';
    } else if (typeof value == 'number' || this.validator.getValidation().isNumeric(value)) {
      return 'numeric';
    } else if (this.validator.getValidation().isArray(value)) {
      return 'array';
    }
    return 'string';
  }

  /**
   * Get input value
   */
  public getInput() {
    return this.validator.getInput(this.fieldName);
  }

  /**
   * Add error message
   */
  public addError(ruleName: string, message: string, attrs?: KeyValuePair<string | number>): void {
    this.errors.push({ rule: ruleName, message: _.template(message)(attrs || {}) });
  }

  /**
   * Get errors
   */
  public getErrors(): FieldValidationError[] {
    return this.errors;
  }

  /**
   * Check validation errors is not empty
   */
  public hasErrors(): boolean {
    return this.errors.length ? true : false;
  }

  /**
   * Validate field and save errors
   */
  public async check(): Promise<boolean> {
    this.errors = [];
    let valueIsEmpty = this.validator.getValidation().isEmpty(this.getInput());
    for (let rule in this.rules) {

      if (valueIsEmpty && !this.rules[rule].goWithUndefined) {
        continue;
      }

      let pass = true;
      if (this.rules[rule].async) {
        pass = await this.rules[rule].handle.call(this);
      } else {
        pass = this.rules[rule].handle.call(this);
      }

      if (!pass) {
        let error = this.rules[rule].message.call(this);
        this.addError(rule, error.message, error.attrs);
      }
    }

    return this.hasErrors();
  }
}

/**
 * FormValidator class
 */
export class FormValidator {

  /**
   * Map of field validators
   */
  private fields: KeyValuePair<FieldValidator> = {};

  /**
   * Map of validation errors
   */
  private fieldErrors: KeyValuePair<FieldValidationError[]> = {};

  /**
   * Validator constructor
   */
  constructor(private validation: Validation, private input: Store) {}

  /**
   * Get error message template
   */
  public getErrorTemplate(key: string) {
    return this.validation.getContext().getLocale().getValidation(key);
  }

  /**
   * Initiate rules for the given field name
   */
  public field(fieldName: string, fieldLabel?: string): FieldValidator {
    if (!this.fields[fieldName]) {
      this.fields[fieldName] = new FieldValidator(this, fieldName, fieldLabel);
    }
    return this.fields[fieldName];
  }

  /**
   * Get validation service instance
   */
  public getValidation(): Validation {
    return this.validation;
  }

  /**
   * Get a value from input
   */
  public getInput(key: string): any {
    return this.input.get(key);
  }

  /**
   * Add input or replace if a key already exists
   */
  public addInput(key: string, value: any): void {
    this.input.set(key, value);
  }

  /**
   * Validate all fields
   */
  public async validate(): Promise<boolean> {
    this.fieldErrors = {};
    for (let fieldName in this.fields) {
      await this.fields[fieldName].check();
      if (this.fields[fieldName].hasErrors()) {
        this.fieldErrors[fieldName] = this.fields[fieldName].getErrors();
      }
    }
    return !this.hasErrors();
  }

  /**
   * Check if form validator has errors
   */
  public hasErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }

  /**
   * Validate and throw error if validation fails
   */
  public async validateAndThrow(): Promise<void> {
    if (!(await this.validate())) {
      throw new FormValidationError(this.getErrors());
    }
  }

  /**
   * Get errors
   */
  public getErrors(): KeyValuePair<FieldValidationError[]> {
    return this.fieldErrors;
  }
}

/**
 * Validator class
 */
export class Validation extends Service {

  /**
   * Check if value given is a valid file
   */
  public isFile(val: any): boolean {
    return val instanceof File;
  }

  /**
   * Check if value given is an image
   */
  public isImage(val: any) {
    if (!this.isFile(val)) return false;

    const extension = (val as File).guessExtension();
    if (!extension) return false;

    return ['jpeg', 'png', 'gif', 'bmp', 'svg'].indexOf(extension) != -1;
  }

  /**
   * Check if value given is a valid email address
   */
  public isEmail(val: string): boolean {
    return new RegExp(
      `^(([^<>()[\\]\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\.,;:\\s@\\"]+)*)|(\\".+\\"))` +
      `@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$`
    ).test(val);
  }

  /**
   * Check if value is yes, 1 or true
   */
  public isAccepted(val: string | boolean | number): boolean {
    if (typeof val == 'string') {
      return val.toLowerCase() == 'yes';
    } else if (typeof val == 'boolean') {
      return val == true;
    } else if (typeof val == 'number') {
      return val == 1;
    }
    return false;
  }

  /**
   * Get number of value of numeric or get size if value is a string, file or array.
   */
  private getValueOrSize(value: string | number | File | any[]): number {
    if (value instanceof File) {
      return value.size;
    } else if (typeof value == 'number') {
      return value;
    } else if (this.isNumeric(value)) {
      return parseFloat(value as string);
    }
    return value.length;
  }

  /**
   * Check if first parameter is greater than second parameter
   */
  public isGreaterThan(val: string | number | File | any[], compareValue: number): boolean {
    return this.getValueOrSize(val) > compareValue;
  }

  /**
   * Check if first parameter is greater than or equal to second parameter
   */
  public isGreaterThanOrEqual(val: string | number | File | any[], compareValue: number): boolean {
    return this.getValueOrSize(val) >= compareValue;
  }

  /**
   * Check if first parameter is less than second parameter
   */
  public isLessThan(val: string | number | File | any[], compareValue: number): boolean {
    return this.getValueOrSize(val) < compareValue;
  }

  /**
   * Check if first parameter is less than or equal to second parameter
   */
  public isLessThanOrEqual(val: string | number | File | any[], compareValue: number): boolean {
    return this.getValueOrSize(val) <= compareValue;
  }

  /**
   * Check if first parameter is equal to second parameter
   */
  public isEqual(val: string | number | File | any[], compareValue: number): boolean {
    return this.getValueOrSize(val) == compareValue;
  }

  /**
   * Date validation
   */
  public isDate(date: moment.MomentInput): boolean {
    return moment(date).isValid();
  }

  /**
   * Empty check
   */
  public isEmpty(val: any): boolean {
    if (_.isNone(val)) {
      return true;
    }
    let str = `${val}`.replace(/\s/g, '');
    return str.length > 0 ? false : true;
  }

  /**
   * After date validation
   */
  public isAfter(dateToCheck: moment.MomentInput, afterDate: moment.MomentInput): boolean {
    return moment(dateToCheck).isAfter(afterDate);
  }

  /**
   * After or same date validation
   */
  public isAfterOrEqual(dateToCheck: moment.MomentInput, afterDate: moment.MomentInput): boolean {
    return moment(dateToCheck).isSameOrAfter(afterDate);
  }

  /**
   * Check if two values are the same
   */
  public isSame(firstVal: any, secondVal: any): boolean {
    return firstVal === secondVal;
  }

  /**
   * Alphabetic characters validation
   */
  public isAlpha(val: string): boolean {
    return (/^[a-zA-Z]+$/).test(val);
  }

  /**
   * Alphabetic characters with space validation
   */
  public isAlphaSpace(val: string): boolean {
    return (/^[a-zA-Z\s]+$/).test(val);
  }

  /**
   * Alpha dash validation
   */
  public isAlphaDash(val: string): boolean {
    return (/^[a-zA-Z0-9_\-]+$/).test(val);
  }

  /**
   * Alpha numeric validation
   */
  public isAlphaNum(val: string): boolean {
    return (/^[a-zA-Z0-9]+$/).test(val);
  }

  /**
   * Array validation
   */
  public isArray(val: any): boolean {
    return Array.isArray(val) && val instanceof Array;
  }

  /**
   * Before date validation
   */
  public isBefore(dateToCheck: moment.MomentInput, beforeDate: moment.MomentInput): boolean {
    return moment(dateToCheck).isBefore(beforeDate);
  }

  /**
   * Before or same date validation
   */
  public isBeforeOrEqual(dateToCheck: moment.MomentInput, beforeDate: moment.MomentInput) {
    return moment(dateToCheck).isSameOrBefore(beforeDate);
  }

  /**
   * In rule
   */
  public isValueIn(val: any, list: any[]): boolean {
    return _.indexOf(list, val) > -1;
  }

  /**
   * Numeric check
   */
  public isNumeric(val: any): boolean {
    return typeof val != 'boolean' && !isNaN(Number(val));
  }

  /**
   * String check
   */
  public isString(val: any): boolean {
    return _.isString(val);
  }

  /**
   * Create FormValidator instance
   */
  public createForm(input: KeyValuePair = {}): FormValidator {
    return new FormValidator(this, new Store(input));
  }
}

/**
 * Decorator to create a validator for a class method
 */
export function Validate() {
  return (target: Object, propertyKey: string, desc: PropertyDescriptor) => {

    if (typeof desc.value != 'function') {
      throw new Error(`${propertyKey} is not valid for Validate decorator. Must be a function`);
    }

    const originalMethod = desc.value;
    const paramNames = _.getFunctionParamNames(originalMethod);

    desc.value = async function (this: Service) {
      if (arguments.length) {

        const validation: Validation = (this as any).context.make(Validation);
        const validator = validation.createForm();

        let args = Array.from(arguments);
        for (let paramIndex in args) {
          if (!paramNames[paramIndex]) continue;

          validator.addInput(paramNames[paramIndex], args[paramIndex]);

          let rules: FieldRule[] = Metadata.get(target, `fieldRules:${propertyKey}:${paramIndex}`);
          if (Array.isArray(rules)) {
            for (let rule of rules) {
              rule(validator.field(paramNames[paramIndex], Metadata.get(target, `fieldLabel:${propertyKey}:${paramIndex}`)));
            }
          }
        }

        await validator.validateAndThrow();
      }

      return originalMethod.apply(this, arguments);
    };
  };
}

/**
 * FieldRule interface
 */
export interface FieldRule {
  (field: FieldValidator): void;
}

/**
 * Decorator to add validation rules on a parameter
 */
export function Field(rules: (string | FieldRule)[], label?: string): (target: Object, propertyKey: string, parameterIndex: number) => void;

/**
 * Decorator to add validation rules on a parameter
 */
export function Field(rule: string, label?: string): (target: Object, propertyKey: string, parameterIndex: number) => void;

/**
 * Decorator to add validation rules on a parameter
 */
export function Field(rules: FieldRule, label?: string): (target: Object, propertyKey: string, parameterIndex: number) => void;

/**
 * Decorator to add validation rules on a parameter
 */
export function Field(rules: string | FieldRule | (string | FieldRule)[], label?: string) {
  return (target: Object, propertyKey: string, parameterIndex: number) => {

    if (typeof rules == 'string' || typeof rules == 'function') {
      rules = [rules];
    }

    rules = rules.map(rule => {
      let fnRule = rule;
      if (typeof rule == 'string') {
        fnRule = (field) => (field as any)[rule]();
      }
      return fnRule;
    });

    Metadata.set(target, `fieldRules:${propertyKey}:${parameterIndex}`, rules);
    if (label) {
      Metadata.set(target, `fieldLabel:${propertyKey}:${parameterIndex}`, label);
    }
  };
}
