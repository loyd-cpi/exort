/// <reference types="node" />
import * as lodash from 'lodash';
import 'reflect-metadata';
/**
 * Standard object interface
 */
export interface KeyValuePair<T = any> {
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
     * Get parameter names of class constructor
     */
    getConstructorParamNames(fn: Function): string[];
    /**
     * Get parameter names of a function or string representation of a function
     */
    getFunctionParamNames(fn: Function | string): string[];
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
 * Metadata namespace
 */
export declare namespace Metadata {
    /**
     * Prefix for all metadata keys registered using Metadata.set
     */
    const PREFIX = "exort:";
    /**
     * Define metadata with auto prefix 'exort'
     */
    function set(target: Object, key: string, value: any): void;
    /**
     * Get metadata defined using Metadata.set
     */
    function get(target: Object, key: string): any;
}
