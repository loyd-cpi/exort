"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const service_1 = require("../../core/service");
const service_2 = require("./service");
/**
 * Abstract EventHandler class
 */
class EventHandler {
    /**
     * EventHandler constructor
     */
    constructor(socket) {
        this.socket = socket;
        this.context = socket.context;
        this.app = socket.context.app;
    }
}
tslib_1.__decorate([
    service_1.Bind(type => service_2.BroadcasterService),
    tslib_1.__metadata("design:type", service_2.BroadcasterService)
], EventHandler.prototype, "broadcaster", void 0);
exports.EventHandler = EventHandler;
/**
 * Abstract EventListener class
 */
class EventListener extends EventHandler {
}
exports.EventListener = EventListener;
/**
 * Abstract EventMiddleware class
 */
class EventMiddleware extends EventHandler {
}
exports.EventMiddleware = EventMiddleware;
//# sourceMappingURL=handler.js.map