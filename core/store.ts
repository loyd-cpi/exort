import { KeyValuePair, _ } from './misc';

/**
 * Store class
 */
export class Store {

  /**
   * Store constructor
   */
  constructor(protected content: KeyValuePair = {}) {}

  /**
   * Get all
   */
  public all(): KeyValuePair {
    return _.clone(this.content);
  }

  /**
   * Merge another Store object
   */
  public merge(content: Store): void {
    this.content = _.merge(this.content, content.all());
  }

  /**
   * Convert dotted notation key to brackets
   */
  private convertToBrackets(key: string): string {
    return `["${key.split('.').join('"]["')}"]`;
  }

  /**
   * Get a value from content
   */
  public get(key: string, defaultVal?: any): any {
    let val;
    if (key.indexOf('.') == -1) {
      val = this.content[key];
    } else {
      try {
        val = eval(`this.content${this.convertToBrackets(key)}`);
      } catch (e) {}
    }
    return _.defaultIfNone(val, defaultVal);
  }

  /**
   * Set a value to store
   */
  public set(key: string, val: any): void {
    this.content[key] = val;
  }

  /**
   * Delete a value by key
   */
  public delete(key: string): void {
    delete this.content[key];
  }

  /**
   * Check if value exists by using a key
   */
  public has(key: string): boolean {
    return typeof this.get(key) != 'undefined';
  }
}

/**
 * Base input class
 */
export class Input extends Store {

  /**
   * Get input except for specified fields
   */
  public except(exception: string[]): KeyValuePair {
    let values: KeyValuePair<string> = {};
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
  public only(fields: string[]): KeyValuePair {
    let values: KeyValuePair<string> = {};
    for (let field of fields) {
      let value = this.get(field);
      if (typeof value != 'undefined') {
        values[field] = value;
      }
    }
    return values;
  }
}
