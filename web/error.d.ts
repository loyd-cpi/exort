import { AppProvider } from '../core/app';
import { Error } from '../core/error';
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
/**
 * HttpNotFoundError class
 */
export declare class HttpNotFoundError extends HttpError {
    /**
     * Status code used
     */
    static STATUS_CODE: number;
    /**
     * HttpNotFoundError constructor
     */
    constructor(message?: string);
}
/**
 * HttpBadRequestError class
 */
export declare class HttpBadRequestError extends HttpError {
    /**
     * Status code used
     */
    static STATUS_CODE: number;
    /**
     * HttpBadRequestError constructor
     */
    constructor(message?: string);
}
/**
 * HttpEntityError class
 */
export declare class HttpEntityError extends HttpError {
    /**
     * Status code used
     */
    static STATUS_CODE: number;
    /**
     * HttpEntityError constructor
     */
    constructor(message?: string);
}
/**
 * HttpServerError class
 */
export declare class HttpServerError extends HttpError {
    /**
     * Status code used
     */
    static STATUS_CODE: number;
    /**
     * HttpServerError constructor
     */
    constructor(message?: string);
}
/**
 * Provide HttpErrorHandler
 */
export declare function provideHttpErrorHandler(errorHandlerPath?: string): AppProvider;
