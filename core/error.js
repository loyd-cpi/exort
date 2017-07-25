"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base ErrorHandler class
 */
class ErrorHandler {
    /**
     * ErrorHandler constructor
     */
    constructor(app, context) {
        this.app = app;
        this.context = context;
    }
}
exports.ErrorHandler = ErrorHandler;
/**
 * Error class
 */
class Error extends global.Error {
    /**
     * Error constructor
     */
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
    /**
     * toJSON method
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack
        };
    }
}
exports.Error = Error;
//# sourceMappingURL=error.js.map