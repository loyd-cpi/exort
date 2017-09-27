"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const service_1 = require("./events/service");
const error_1 = require("../core/error");
const service_2 = require("../core/service");
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
        this.app = request.context.app;
        this.input = request.input;
        this.vars = response.locals;
        this.params = request.params;
        this.session = request.session;
    }
}
tslib_1.__decorate([
    service_2.Bind(type => service_1.BroadcasterService),
    tslib_1.__metadata("design:type", service_1.BroadcasterService)
], HttpHandler.prototype, "broadcaster", void 0);
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
}
exports.HttpErrorHandler = HttpErrorHandler;
//# sourceMappingURL=handler.js.map