import * as lodash from 'lodash';
/**
 * Standard object interface
 */
export interface KeyValuePair<T> {
    [key: string]: T;
}
/**
 * Encoding types for hash.digest
 */
export declare type HexBase64Latin1Encoding = 'latin1' | 'hex' | 'base64';
/**
 * Utilities interface extending lodash functions
 */
export interface Utilities extends lodash.LoDashStatic {
    /**
     * Replace all occurence
     */
    replaceAll(str: string, search: string, replace: string): string;
    /**
     * Check if class extend the given parent class
     */
    classExtends(childClass: Function, parentClass: Function): boolean;
    /**
     * Get parameter names of a function
     */
    getConstructorParamNames(fn: Function): string[];
    /**
     * Require module
     */
    require(filePath: string): any;
    /**
     * Path to require
     */
    requireClass(path: string): Function;
    /**
     * Return the value if not undefined or else return the second parameter
     */
    defaultIfNone(value: any, defaultVal: any, returnNull?: boolean): any;
    /**
     * Generate checksum
     */
    checksum(str: string | Buffer, algorithm?: string, encoding?: string): string;
    /**
     * Delays the program execution for the given number of milliseconds
     */
    sleep(milliseconds: number): Promise<void>;
    /**
     * Check if value is null or undefined
     */
    isNone(value: any): boolean;
}
declare const _: Utilities;
export { _ };
/**
 * Store class
 */
export declare class Store {
    protected content: KeyValuePair<any>;
    /**
     * Store constructor
     */
    constructor(content?: KeyValuePair<any>);
    /**
     * Get all
     */
    all(): KeyValuePair<any>;
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
