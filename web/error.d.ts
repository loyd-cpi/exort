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
     * HttpNotFoundError constructor
     */
    constructor(message?: string);
}
/**
 * HttpBadRequestError class
 */
export declare class HttpBadRequestError extends HttpError {
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
     * HttpEntityError constructor
     */
    constructor(message?: string);
}
/**
 * HttpServerError class
 */
export declare class HttpServerError extends HttpError {
    /**
     * HttpServerError constructor
     */
    constructor(message?: string);
}
