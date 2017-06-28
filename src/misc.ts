import * as lodash from 'lodash';
import * as crypto from 'crypto';
import * as pathlib from 'path';

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
export type HexBase64Latin1Encoding = 'latin1' | 'hex' | 'base64';

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

const _ = lodash as Utilities;

_.replaceAll = function (str: string, search: string, replace: string): string {
  return str.replace(new RegExp(_.escapeRegExp(search), 'g'), replace);
};

_.classExtends = function (childClass: Function, parentClass: Function): boolean {
  return typeof childClass == 'function' && childClass.prototype instanceof parentClass;
};

_.require = function (filePath: string): any {
  let content: any;
   try {
    content = require(filePath);
  } catch (err) {
    if (err.code != 'MODULE_NOT_FOUND') {
      throw err;
    }
  }
  return content;
};

_.requireClass = function (path: string): Function {
  let exportedModule = require(path);
  if (typeof exportedModule != 'object') {
    throw new Error(`exports from ${path} must be an object`);
  }

  let classToExport = pathlib.basename(path, '.js');
  if (typeof exportedModule[classToExport] != 'function') {
    throw new Error(`${classToExport} doesn't exists in ${path}`);
  }

  if (exportedModule[classToExport].prototype.constructor.name != classToExport) {
    throw new Error(`Class name must be the same with the filename in: ${path}`);
  }

  return exportedModule[classToExport];
};

const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const DEFAULT_PARAMS = /=[^,]+/mg;
const FAT_ARROWS = /=>.*$/mg;

_.getConstructorParamNames = function (fn: Function): string[] {
  let code = fn.toString();
  if (code.indexOf(' constructor(') == -1) return [];

  code = code.replace(COMMENTS, '')
    .replace(FAT_ARROWS, '')
    .replace(DEFAULT_PARAMS, '');

  let result = code.slice(code.indexOf('(') + 1, code.indexOf(')'))
    .match(/([^\s,]+)/g);

  return result === null
    ? []
    : result;
};

_.isNone = function (value: any): boolean {
  return typeof value == 'undefined' || _.isNull(value);
};

_.defaultIfNone = function (value: any, defaultVal: any, returnNull: boolean = false) {
  if (typeof value == 'undefined') {
    if (returnNull) {
      if (typeof defaultVal != 'undefined') {
        return defaultVal;
      }
      return null;
    } else if (typeof defaultVal != 'undefined') {
      return defaultVal;
    }
  }
  return value;
};

_.sleep = async function (milliseconds: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    setTimeout(() => resolve(), milliseconds);
  });
};

_.checksum = function (str: string | Buffer, algorithm: string = 'md5', encoding: HexBase64Latin1Encoding = 'hex'): string {
  return crypto.createHash(algorithm).update(str, 'utf8').digest(encoding);
};

export { _ };

/**
 * Store class
 */
export class Store {

  /**
   * Store constructor
   * @param {KeyValuePair<any> = {}} private content
   */
  constructor(protected content: KeyValuePair<any> = {}) {}

  /**
   * Get all
   * @return {KeyValuePair<any>}
   */
  public all(): KeyValuePair<any> {
    return _.clone(this.content);
  }

  /**
   * Merge another Store object
   * @param {Store} content
   */
  public merge(content: Store): void {
    this.content = _.merge(this.content, content.all());
  }

  /**
   * Convert dotted notation key to brackets
   * @param  {string} key
   * @return {string}
   */
  private convertToBrackets(key: string): string {
    return `["${key.split('.').join('"]["')}"]`;
  }

  /**
   * Get a value from content
   * @param  {string} key
   * @param  {any} defaultVal
   * @return {any}
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
   * @param {string} key
   * @param {any} val
   */
  public set(key: string, val: any): void {
    this.content[key] = val;
  }

  /**
   * Delete a value by key
   * @param {string} key
   */
  public delete(key: string): void {
    delete this.content[key];
  }

  /**
   * Check if value exists by using a key
   * @param  {string}  key
   * @return {boolean}
   */
  public has(key: string): boolean {
    return typeof this.get(key) != 'undefined';
  }
}
