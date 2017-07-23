import { KeyValuePair } from './misc';

/**
 * Base ModelToJsonOptions interface
 */
export interface ModelToJsonOptions {
  hidden?: string[];
}

/**
 * Model class
 */
export abstract class Model {

  /**
   * Abstract toJSON method
   */
  public abstract toJSON(options?: ModelToJsonOptions): KeyValuePair;
}
