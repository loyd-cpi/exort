"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const validation_1 = require("../core/validation");
const service_1 = require("../core/service");
const handler_1 = require("./handler");
const error_1 = require("../core/error");
const misc_1 = require("../core/misc");
const STATUSES = require('statuses');
/**
 * HttpError class
 */
class HttpError extends error_1.Error {
    /**
     * HttpError constructor
     */
    constructor(statusCode, message) {
        super(message || STATUSES[statusCode]);
        this.statusCode = statusCode;
        if (statusCode < 400) {
            throw new error_1.Error('HttpError only accepts status codes greater than 400');
        }
        if (!STATUSES[statusCode]) {
            throw new error_1.Error('HttpError invalid status code');
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
        super(HttpNotFoundError.STATUS_CODE, message);
    }
}
/**
 * Status code used
 */
HttpNotFoundError.STATUS_CODE = 404;
exports.HttpNotFoundError = HttpNotFoundError;
/**
 * HttpBadRequestError class
 */
class HttpBadRequestError extends HttpError {
    /**
     * HttpBadRequestError constructor
     */
    constructor(message) {
        super(HttpBadRequestError.STATUS_CODE, message);
    }
}
/**
 * Status code used
 */
HttpBadRequestError.STATUS_CODE = 400;
exports.HttpBadRequestError = HttpBadRequestError;
/**
 * HttpEntityError class
 */
class HttpEntityError extends HttpError {
    /**
     * HttpEntityError constructor
     */
    constructor(message) {
        super(HttpEntityError.STATUS_CODE, message);
    }
}
/**
 * Status code used
 */
HttpEntityError.STATUS_CODE = 422;
exports.HttpEntityError = HttpEntityError;
/**
 * HttpServerError class
 */
class HttpServerError extends HttpError {
    /**
     * HttpServerError constructor
     */
    constructor(message) {
        super(HttpServerError.STATUS_CODE, message);
    }
}
/**
 * Status code used
 */
HttpServerError.STATUS_CODE = 500;
exports.HttpServerError = HttpServerError;
/**
 * Prepare error before passing to render
 */
function prepareResponse(response, err) {
    if (err instanceof validation_1.FormValidationError || err instanceof service_1.ServiceError) {
        response.status(HttpEntityError.STATUS_CODE);
    }
    else if (err instanceof HttpError) {
        response.status(err.statusCode);
    }
    else {
        response.status(HttpServerError.STATUS_CODE);
    }
}
/**
 * Provide HttpErrorHandler
 */
function provideHttpErrorHandler(errorHandlerPath) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!errorHandlerPath) {
            errorHandlerPath = `${app.bootDir}/ErrorHandler`;
        }
        const HttpErrorHandlerClass = misc_1._.requireClass(errorHandlerPath);
        if (!misc_1._.classExtends(HttpErrorHandlerClass, handler_1.HttpErrorHandler)) {
            throw new error_1.Error('ErrorHandler must extends HttpErrorHandler');
        }
        app.use((err, request, response, next) => {
            const httpErrorHandler = new HttpErrorHandlerClass(app, request.context);
            httpErrorHandler.report(err).then(() => {
                prepareResponse(response, err);
                httpErrorHandler.render(err, request, response);
            }).catch(err => console.error(err));
        });
    });
}
exports.provideHttpErrorHandler = provideHttpErrorHandler;
//# sourceMappingURL=error.js.map