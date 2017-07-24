"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const STATUSES = require('statuses');
/**
 * HttpError class
 */
class HttpError extends Error {
    /**
     * HttpError constructor
     */
    constructor(statusCode, message) {
        super(message || STATUSES[statusCode]);
        this.statusCode = statusCode;
        if (statusCode < 400) {
            throw new Error('HttpError only accepts status codes greater than 400');
        }
        if (!STATUSES[statusCode]) {
            throw new Error('HttpError invalid status code');
        }
    }
}
exports.HttpError = HttpError;
/**
 * HttpNotFoundError class
 */
class HttpNotFoundError extends HttpError {
    /**
     * HttpNotFoundError constructor
     */
    constructor(message) {
        super(404, message);
    }
}
exports.HttpNotFoundError = HttpNotFoundError;
/**
 * HttpBadRequestError class
 */
class HttpBadRequestError extends HttpError {
    /**
     * HttpBadRequestError constructor
     */
    constructor(message) {
        super(400, message);
    }
}
exports.HttpBadRequestError = HttpBadRequestError;
/**
 * HttpEntityError class
 */
class HttpEntityError extends HttpError {
    /**
     * HttpEntityError constructor
     */
    constructor(message) {
        super(422, message);
    }
}
exports.HttpEntityError = HttpEntityError;
/**
 * HttpServerError class
 */
class HttpServerError extends HttpError {
    /**
     * HttpServerError constructor
     */
    constructor(message) {
        super(500, message);
    }
}
exports.HttpServerError = HttpServerError;
//# sourceMappingURL=error.js.map