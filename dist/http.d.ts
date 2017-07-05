import { AppProvider, Application } from './app';
import { Service, Context } from './service';
import { KeyValuePair, Store } from './misc';
import * as formidable from 'formidable';
import { File } from './filesystem';
import { Session } from './session';
import * as express from 'express';
/**
 * Request interface
 */
export interface Request extends express.Request {
    /**
     * Contains parsed request body
     * @type {KeyValuePair<string>}
     */
    body: KeyValuePair<string>;
    /**
     * Session object
     * @type {Session}
     */
    session: Session;
    /**
     * Input object that contains parsed body and query string
     * @type {Input}
     */
    input: Input;
    /**
     * Make an instance of service
     * @param  {(new(...args: any[]) => U)} serviceClass
     * @return {U}
     */
    make<U extends Service>(serviceClass: new (...args: any[]) => U): U;
    /**
     * Context instance
     * @type {Context}
     */
    readonly context: Context;
}
/**
 * Install body parser
 * @param  {Application} app
 * @return {AppProvider}
 */
export declare function provideBodyParser(): AppProvider;
/**
 * Input class
 */
export declare class Input extends Store {
    private req;
    /**
     * File input
     * @type {KeyValuePair<any>}
     */
    private fileInput;
    /**
     * Input constructor
     * @param {Request} private req
     */
    constructor(req: Request);
    /**
     * Get input except for specified fields
     * @param  {string[]} exception
     * @return {KeyValuePair<any>}
     */
    except(exception: string[]): KeyValuePair<any>;
    /**
     * Get input only for specified fields
     * @param  {string[]} fields
     * @return {KeyValuePair<any>}
     */
    only(fields: string[]): KeyValuePair<any>;
    /**
     * Has file
     * @param  {string} key
     * @return {boolean}
     */
    hasFile(key: string): boolean;
    /**
     * Get input file
     * @param  {string} key
     * @return {UploadedFile}
     */
    file(key: string): UploadedFile | undefined;
    /**
     * Get input files
     * @param  {string} key
     * @return {UploadedFile[]}
     */
    files(key: string): UploadedFile[] | undefined;
}
/**
 * UploadedFile class
 */
export declare class UploadedFile extends File {
    /**
     * Flag if uploaded file is already moved to another location
     * @type {boolean}
     */
    private moved;
    /**
     * Flag if uploaded file is currently in process
     * @type {boolean}
     */
    private processing;
    /**
     * UploadedFile constructor
     * @param {formidable.File} uploaded
     */
    constructor(uploaded: formidable.File);
    /**
     * Get JSON Object
     * @return {KeyValuePair<any>}
     */
    toJSON(): KeyValuePair<any>;
    /**
     * Check availability of file for processing
     */
    isMovedOrInProcess(): boolean;
    /**
     * Move uploaded file
     * @param  {string} destination
     * @param  {string} fileName
     * @return {Promise<boolean>}
     */
    move(destination: string, fileName?: string): Promise<boolean>;
    /**
     * Delete temporary file
     * @return {Promise<boolean>}
     */
    deleteTempFile(): Promise<boolean>;
}
/**
 * Response interface
 */
export interface Response extends express.Response {
}
/**
 * Start HTTP Server
 * @param  {Application} app
 * @param  {AppProvider[]} providers
 * @return {Promise<Application>}
 */
export declare function startServer(app: Application, providers: AppProvider[]): Promise<Application>;
/**
 * HttpError class
 */
export declare class HttpError extends Error {
    statusCode: number;
    /**
     * HttpError constructor
     * @param {number} statusCode
     * @param {string} message
     */
    constructor(statusCode: number, message?: string);
}
