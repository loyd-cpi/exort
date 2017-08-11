"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const handler_1 = require("./handler");
const app_1 = require("../core/app");
const error_1 = require("../core/error");
const express = require("express");
const misc_1 = require("../core/misc");
/**
 * Provide routes
 */
function provideRoutes(routesModule, controllersDir, middlewareDir) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        if (controllersDir) {
            controllersDir = misc_1._.trimEnd(controllersDir, '/');
        }
        else {
            controllersDir = `${app.bootDir}/controllers`;
        }
        if (middlewareDir) {
            middlewareDir = misc_1._.trimEnd(middlewareDir, '/');
        }
        else {
            middlewareDir = `${app.bootDir}/middleware`;
        }
        let routes = require(routesModule || `${app.bootDir}/routes`);
        if (typeof routes != 'object') {
            throw new error_1.Error('Invalid routes file');
        }
        if (typeof routes.setup == 'function') {
            let router = new Router(app.config.get('router', {}), controllersDir, middlewareDir);
            routes.setup(router, app);
            app.use(router.getExpressRouter());
        }
    });
}
exports.provideRoutes = provideRoutes;
/**
 * Router class
 */
class Router {
    /**
     * Router constructor
     */
    constructor(options, controllersDir, middlewareDir) {
        this.options = options;
        this.controllersDir = controllersDir;
        this.middlewareDir = middlewareDir;
        /**
         * Middleware request handlers
         */
        this.middlewareHandlers = [];
        this.expressRouter = express.Router(options);
        this.options.prefix = misc_1._.trim(this.options.prefix || '', '/');
        this.options.namespace = misc_1._.trim(this.options.namespace || '', '/');
    }
    /**
     * Get express.Router
     */
    getExpressRouter() {
        return this.expressRouter;
    }
    /**
     * Set global route middleware for this current Router instance
     */
    middleware(classNameOrHandler) {
        if (typeof classNameOrHandler == 'string') {
            classNameOrHandler = this.findRouteMiddleware(classNameOrHandler);
        }
        this.middlewareHandlers.push(classNameOrHandler);
    }
    /**
     * Resolve and return middleware instance
     */
    findRouteMiddleware(className) {
        const middlewareClass = misc_1._.requireClass(`${this.middlewareDir}/${className}`);
        if (!misc_1._.classExtends(middlewareClass, handler_1.HttpMiddleware)) {
            throw new error_1.Error(`${className} doesn't extend HttpMiddleware`);
        }
        return (request, response, next) => {
            let middlewareInstance = Reflect.construct(middlewareClass, [request, response]);
            let handleRet = middlewareInstance.handle(next);
            if (handleRet instanceof Promise) {
                handleRet.catch(err => next(err));
            }
        };
    }
    /**
     * Set route using custom method
     */
    route(method, path, controller, middleware) {
        const [controllerName, actionName] = controller.split('@');
        const controllerClass = misc_1._.requireClass(`${this.controllersDir}${this.namespace(controllerName)}`);
        if (!misc_1._.classExtends(controllerClass, handler_1.HttpController)) {
            throw new error_1.Error(`${controllerName} doesn't extend HttpController`);
        }
        if (typeof controllerClass.prototype[actionName] != 'function') {
            throw new error_1.Error(`${controllerClass.name} doesn't have ${actionName} method`);
        }
        const middlewareHandlers = [];
        if (Array.isArray(middleware)) {
            for (let mware of middleware) {
                if (typeof mware == 'string') {
                    mware = this.findRouteMiddleware(mware);
                }
                middlewareHandlers.push(mware);
            }
        }
        middlewareHandlers.push((request, response, next) => {
            let controller = Reflect.construct(controllerClass, [request, response]);
            let actionRet = controller[actionName]();
            if (actionRet instanceof Promise) {
                actionRet.catch(err => next(err));
            }
        });
        this.expressRouter[method.toLowerCase()](this.prefix(path), this.middlewareHandlers.concat(middlewareHandlers));
    }
    /**
     * Apply prefix
     */
    prefix(path) {
        path = `/${misc_1._.trim(path, '/')}`;
        if (this.options.prefix) {
            return `/${this.options.prefix}${path}`;
        }
        return path;
    }
    /**
     * Apply namespace
     */
    namespace(path) {
        path = `/${misc_1._.trim(path, '/')}`;
        if (this.options.namespace) {
            path = `/${this.options.namespace}${path}`;
        }
        return path;
    }
    /**
     * Set GET route method
     */
    get(path, controller, middleware) {
        this.route('GET', path, controller, middleware);
    }
    /**
     * Set POST route method
     */
    post(path, controller, middleware) {
        this.route('POST', path, controller, middleware);
    }
    /**
     * Set PUT route method
     */
    put(path, controller, middleware) {
        this.route('PUT', path, controller, middleware);
    }
    /**
     * Set DELETE route method
     */
    delete(path, controller, middleware) {
        this.route('DELETE', path, controller, middleware);
    }
    /**
     * Create route group
     */
    group(options, closure) {
        if (typeof options == 'function') {
            closure = options;
            options = {};
        }
        if (typeof closure != 'function')
            return;
        let mergedOptions = misc_1._.merge({}, this.options, options);
        if (options.prefix) {
            mergedOptions.prefix = this.prefix(options.prefix);
        }
        if (options.namespace) {
            mergedOptions.namespace = this.namespace(options.namespace);
        }
        let router = new Router(mergedOptions, this.controllersDir, this.middlewareDir);
        for (let handler of this.middlewareHandlers) {
            router.middleware(handler);
        }
        closure(router);
        this.expressRouter.use(router.getExpressRouter());
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map