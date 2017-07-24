"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const error_1 = require("../core/error");
/**
 * Abstract HttpHandler class
 */
class HttpHandler {
    /**
     * HttpHandler constructor
     */
    constructor(request, response) {
        this.request = request;
        this.response = response;
        this.context = request.context;
        this.input = request.input;
        this.vars = response.locals;
        this.params = request.params;
    }
}
exports.HttpHandler = HttpHandler;
/**
 * HttpMiddleware class
 */
class HttpMiddleware extends HttpHandler {
}
exports.HttpMiddleware = HttpMiddleware;
/**
 * Abstract HttpController class
 */
class HttpController extends HttpHandler {
}
exports.HttpController = HttpController;
/**
 * Abstract HttpErrorHandler class
 */
class HttpErrorHandler extends error_1.ErrorHandler {
    /**
     * Report error
     */
    report(error) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * Render error
     */
    render(error, request, response) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.HttpErrorHandler = HttpErrorHandler;
//# sourceMappingURL=handler.js.map