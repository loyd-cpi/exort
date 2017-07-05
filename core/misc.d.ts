import * as lodash from 'lodash';
/**
 * Standard object interface
 */
export interface KeyValuePair<T> {
    [key: string]: T;
}
/**
 * Encoding types for hash.digest
 * @type {string}
 */
export declare type HexBase64Latin1Encoding = 'latin1' | 'hex' | 'base64';
/**
 * Utilities interface extending lodash functions
 */
export interface Utilities extends lodash.LoDashStatic {
    /**
     * Replace all occurence
     * @param  {string} str
     * @param  {string} search
     * @param  {string} replace
     * @return {string}
     */
    replaceAll(str: string, search: string, replace: string): string;
    /**
     * Check if class extend the given parent class
     * @param  {Function} childClass
     * @param  {Function} parentClass
     * @return {boolean}
     */
    classExtends(childClass: Function, parentClass: Function): boolean;
    /**
     * Get parameter names of a function
     * @param  {Function} fn
     * @return {string[]}
     */
    getConstructorParamNames(fn: Function): string[];
    /**
     * Require module
     * @param  {string} filePath
     * @return {any}
     */
    require(filePath: string): any;
    /**
     * Path to require
     * @param  {string} path
     * @return {Function}
     */
    requireClass(path: string): Function;
    /**
     * Return the value if not undefined or else return the second parameter
     * @param  {any} value
     * @param  {any} defaultVal
     * @param  {any} returnNull
     * @return {any}
     */
    defaultIfNone(value: any, defaultVal: any, returnNull?: boolean): any;
    /**
     * Generate checksum
     * @param  {string | Buffer} str
     * @param  {string = 'md5'} algorithm
     * @param  {string = 'hex'} encoding
     * @return {string}
     */
    checksum(str: string | Buffer, algorithm?: string, encoding?: string): string;
    /**
     * Delays the program execution for the given number of milliseconds
     * @param  {number} milliseconds
     * @return {Promise<void>}
     */
    sleep(milliseconds: number): Promise<void>;
    /**
     * Check if value is null or undefined
     * @param  {any} value
     * @return {boolean}
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
     * @param {KeyValuePair<any> = {}} private content
     */
    constructor(content?: KeyValuePair<any>);
    /**
     * Get all
     * @return {KeyValuePair<any>}
     */
    all(): KeyValuePair<any>;
    /**
     * Merge another Store object
     * @param {Store} content
     */
    merge(content: Store): void;
    /**
     * Convert dotted notation key to brackets
     * @param  {string} key
     * @return {string}
     */
    private convertToBrackets(key);
    /**
     * Get a value from content
     * @param  {string} key
     * @param  {any} defaultVal
     * @return {any}
     */
    get(key: string, defaultVal?: any): any;
    /**
     * Set a value to store
     * @param {string} key
     * @param {any} val
     */
    set(key: string, val: any): void;
    /**
     * Delete a value by key
     * @param {string} key
     */
    delete(key: string): void;
    /**
     * Check if value exists by using a key
     * @param  {string}  key
     * @return {boolean}
     */
    has(key: string): boolean;
}
