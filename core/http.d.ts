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
     */
    body: KeyValuePair<string>;
    /**
     * Session object
     */
    session: Session;
    /**
     * Input object that contains parsed body and query string
     */
    input: Input;
    /**
     * Make an instance of service
     */
    make<U extends Service>(serviceClass: new (...args: any[]) => U): U;
    /**
     * Context instance
     */
    readonly context: Context;
}
/**
 * Install body parser
 */
export declare function provideBodyParser(): AppProvider;
/**
 * Input class
 */
export declare class Input extends Store {
    private req;
    /**
     * File input
     */
    private fileInput;
    /**
     * Input constructor
     */
    constructor(req: Request);
    /**
     * Get input except for specified fields
     */
    except(exception: string[]): KeyValuePair<any>;
    /**
     * Get input only for specified fields
     */
    only(fields: string[]): KeyValuePair<any>;
    /**
     * Has file
     */
    hasFile(key: string): boolean;
    /**
     * Get input file
     */
    file(key: string): UploadedFile | undefined;
    /**
     * Get input files
     */
    files(key: string): UploadedFile[] | undefined;
}
/**
 * UploadedFile class
 */
export declare class UploadedFile extends File {
    /**
     * Flag if uploaded file is already moved to another location
     */
    private moved;
    /**
     * Flag if uploaded file is currently in process
     */
    private processing;
    /**
     * UploadedFile constructor
     */
    constructor(uploaded: formidable.File);
    /**
     * Get JSON Object
     */
    toJSON(): KeyValuePair<any>;
    /**
     * Check availability of file for processing
     */
    isMovedOrInProcess(): boolean;
    /**
     * Move uploaded file
     */
    move(destination: string, fileName?: string): Promise<boolean>;
    /**
     * Delete temporary file
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
 */
export declare function startServer(app: Application, providers: AppProvider[]): Promise<Application>;
/**
 * HttpError class
 */
export declare class HttpError extends Error {
    statusCode: number;
    /**
     * HttpError constructor
     */
    constructor(statusCode: number, message?: string);
}
