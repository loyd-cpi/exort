/// <reference types="express" />
import { BroadcasterService } from './events/service';
import { ErrorHandler, Error } from '../core/error';
import { Input, Request, Response } from './http';
import { Context } from '../core/service';
import { KeyValuePair } from '../core/misc';
import { WebApplication } from './app';
import * as express from 'express';
/**
 * HttpRequestParams interface
 */
export interface HttpRequestParams {
    [param: string]: string;
    [captureGroup: number]: string;
}
/**
 * Abstract HttpHandler class
 */
export declare abstract class HttpHandler {
    protected readonly request: Request;
    protected readonly response: Response;
    /**
     * Context instance
     */
    protected readonly context: Context;
    /**
     * Application instance
     */
    protected readonly app: WebApplication;
    /**
     * Request input instance
     */
    protected readonly input: Input;
    /**
     * Express response locals object
     */
    protected readonly vars: KeyValuePair;
    /**
     * Express request params object
     */
    protected readonly params: HttpRequestParams;
    /**
     * BroadcasterService instance
     */
    protected readonly broadcaster: BroadcasterService;
    /**
     * HttpHandler constructor
     */
    constructor(request: Request, response: Response);
}
/**
 * HttpMiddleware class
 */
export declare abstract class HttpMiddleware extends HttpHandler {
    /**
     * Abstract handle method
     */
    abstract handle(next: express.NextFunction): Promise<void>;
}
/**
 * Abstract HttpController class
 */
export declare abstract class HttpController extends HttpHandler {
}
/**
 * Abstract HttpErrorHandler class
 */
export declare abstract class HttpErrorHandler extends ErrorHandler {
    /**
     * Report error
     */
    report(error: Error): Promise<void>;
    /**
     * Abstract render method
     */
    abstract render(error: Error, request: Request, response: Response): Promise<void>;
}
