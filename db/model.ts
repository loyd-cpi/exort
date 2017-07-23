import { Model as BaseModel, ModelToJsonOptions as BaseModelToJsonOptions } from '../core/model';
import { _, KeyValuePair, Metadata } from '../core/misc';

/**
 * Decorator to exclude fields in toJSON
 */
export function Hidden() {
  return (target: Object, propertyKey: string) => {

    let hiddenFields: string[] = Metadata.get(target, 'model:hidden');
    if (!Array.isArray(hiddenFields)) {
      hiddenFields = [];
    }

    if (hiddenFields.indexOf(propertyKey) == -1) {
      hiddenFields.push(propertyKey);
    }

    Metadata.set(target, 'model:hidden', hiddenFields);
  };
}

/**
 * ModelToJsonOptions interface
 */
export interface ModelToJsonOptions extends BaseModelToJsonOptions {}

/**
 * DB Model class
 */
export class Model extends BaseModel {

  /**
   * Get a JSON serializable object
   */
  public toJSON(options?: ModelToJsonOptions): KeyValuePair<any> {
    let fields: KeyValuePair<any> = _.toPlainObject(this);
    let hiddenFields: string[] = Metadata.get(Object.getPrototypeOf(this), 'model:hidden') || [];
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
