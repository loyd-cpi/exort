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
export declare abstract class Model {
    /**
     * Abstract toJSON method
     */
    abstract toJSON(options?: ModelToJsonOptions): KeyValuePair<any>;
}
