import { KeyValuePair } from './misc';
/**
 * Store class
 */
export declare class Store {
    protected content: KeyValuePair;
    /**
     * Store constructor
     */
    constructor(content?: KeyValuePair);
    /**
     * Get all
     */
    all(): KeyValuePair;
    /**
     * Merge another Store object
     */
    merge(content: Store): void;
    /**
     * Convert dotted notation key to brackets
     */
    private convertToBrackets(key);
    /**
     * Get a value from content
     */
    get(key: string, defaultVal?: any): any;
    /**
     * Set a value to store
     */
    set(key: string, val: any): void;
    /**
     * Delete a value by key
     */
    delete(key: string): void;
    /**
     * Check if value exists by using a key
     */
    has(key: string): boolean;
}
/**
 * Base input class
 */
export declare class Input extends Store {
    /**
     * Get input except for specified fields
     */
    except(exception: string[]): KeyValuePair;
    /**
     * Get input only for specified fields
     */
    only(fields: string[]): KeyValuePair;
}
