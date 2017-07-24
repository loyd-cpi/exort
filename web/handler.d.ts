import { Input, Request, Response } from './http';
import { ErrorHandler } from '../core/error';
import { KeyValuePair } from '../core/misc';
import { Context } from '../core/service';
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
     * Render error
     */
    render(error: Error, request: Request, response: Response): Promise<void>;
}
