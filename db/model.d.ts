import { KeyValuePair } from '../core/misc';
import { Model as BaseModel } from '../core/model';
/**
 * Decorator to exclude fields in toJSON
 */
export declare function Hidden(): (target: Object, propertyKey: string) => void;
/**
 * DB Model class
 */
export declare class Model extends BaseModel {
    /**
     * Get a JSON serializable object
     */
    toJSON(): KeyValuePair<any>;
}
