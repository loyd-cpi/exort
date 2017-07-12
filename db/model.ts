import { Metadata, KeyValuePair } from '../core/misc';
import { Model as BaseModel } from '../core/model';

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
 * DB Model class
 */
export class Model extends BaseModel {

  /**
   * Get a JSON serializable object
   */
  toJSON() {
    let hiddenFields: string[] = Metadata.get(Object.getPrototypeOf(this), 'model:hidden');
    if (Array.isArray(hiddenFields) && hiddenFields.length) {

      let fields: KeyValuePair<any> = {};
      for (let propName in this) {

        if (hiddenFields.indexOf(propName) != -1) continue;
        fields[propName] = this[propName];
      }

      return fields;
    }

    return this;
  }
}
