import { Model as BaseModel } from '../core/model';
/**
 * Decorator to exclude fields in toJSON
 */
export declare function Hidden(): (target: Object, propertyKey: string) => void;
/**
 * ModelToJsonOptions interface
 */
export interface ModelToJsonOptions {
    hidden?: string[];
}
/**
 * DB Model class
 */
export declare class Model extends BaseModel {
    /**
     * Get a JSON serializable object
     */
    toJSON(options?: ModelToJsonOptions): this;
}
