import { AppProvider, Application } from '../core/app';
import { Service, Context } from '../core/service';
import { KeyValuePair, Store } from '../core/misc';
import { File } from '../core/filesystem';
import * as formidable from 'formidable';
import { Session } from './session';
import * as express from 'express';
/**
 * Request interface
 */
export interface Request extends express.Request {
    /**
     * Contains parsed request body
     */
    readonly body: KeyValuePair<string>;
    /**
     * Session object
     */
    readonly session: Session;
    /**
     * Input object that contains parsed body and query string
     */
    readonly input: Input;
    /**
     * Make an instance of service
     */
    make<U extends Service>(serviceClass: new (...args: any[]) => U): U;
    /**
     * Context instance
     */
    readonly context: Context;
    /**
     * Application instance
     */
    readonly app: Application;
}
/**
 * Install body parser
 */
export declare function provideBodyParser(): AppProvider;
/**
 * Input class
 */
export declare class Input extends Store {
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
    except(exception: string[]): KeyValuePair;
    /**
     * Get input only for specified fields
     */
    only(fields: string[]): KeyValuePair;
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
    files(key: string): UploadedFile[];
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
    toJSON(): KeyValuePair;
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
export declare function startServer(app: Application): Promise<Application>;
