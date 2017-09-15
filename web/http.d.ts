/// <reference types="node" />
import { AppProvider, Application } from '../core/app';
import { Service, Context } from '../core/service';
import { Input as BaseInput } from '../core/store';
import { KeyValuePair } from '../core/misc';
import { File } from '../core/filesystem';
import * as formidable from 'formidable';
import { WebApplication } from './app';
import { Session } from './session';
import * as express from 'express';
import * as http from 'http';
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
export declare class Input extends BaseInput {
    /**
     * File input
     */
    private fileInput;
    /**
     * Input constructor
     */
    constructor(req: Request);
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
 * Prepare server for launch
 */
export declare function prepareServer(app: Application): http.Server;
/**
 * Start HTTP Server and convert Application instance to a WebApplication instance
 */
export declare function startServer(app: Application): void;
/**
 * Start HTTP Server and convert Application instance to a WebApplication instance
 * using just one node
 */
export declare function startSingleNodeServer(app: Application): Promise<WebApplication>;
