"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("./app");
const http_1 = require("./http");
const validation_1 = require("./validation");
const express = require("express");
const misc_1 = require("./misc");
/**
 * Provide routes
 */
function provideRoutes(routesFile, controllersDir, middlewareDir) {
    controllersDir = misc_1._.trimEnd(controllersDir, '/');
    middlewareDir = misc_1._.trimEnd(middlewareDir, '/');
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        let routes = require(routesFile);
        if (typeof routes != 'object') {
            throw new Error('Invalid routes file');
        }
        if (typeof routes.setup == 'function') {
            routes.setup(new Router(app.config.get('router', {}), controllersDir, middlewareDir), app);
        }
        app.use((err, req, res, next) => {
            let details = {
                name: err.name,
                message: err.message,
            };
            if (app.config.get('app.env') != 'production') {
                details.stack = err.stack;
            }
            if (err instanceof validation_1.FormValidationError) {
                details.fields = err.fields;
                res.status(422);
            }
            else if (err instanceof http_1.HttpError) {
                res.status(err.statusCode);
            }
            else {
                res.status(500);
            }
            if (req.accepts('json')) {
                res.json({ error: details });
            }
            else if (req.accepts('html')) {
                res.render(`errors/${res.statusCode}`, { error: details });
            }
            else {
                res.send(JSON.stringify(details));
            }
        });
    });
}
exports.provideRoutes = provideRoutes;
/**
 * Abstract Controller class
 */
class Controller {
    /**
     * Controller constructor
     */
    constructor(context) {
        this.context = context;
    }
}
exports.Controller = Controller;
/**
 * Abstract HttpController class
 */
class HttpController extends Controller {
    /**
     * HttpController constructor
     */
    constructor(request, response) {
        super(request.context);
        this.request = request;
        this.response = response;
    }
    /**
     * Getter for request.input
     */
    get input() {
        return this.request.input;
    }
}
exports.HttpController = HttpController;
/**
 * Abstract Middleware class
 */
class Middleware {
    /**
     * Middleware constructor
     */
    constructor(context) {
        this.context = context;
    }
}
exports.Middleware = Middleware;
/**
 * HttpMiddleware class
 */
class HttpMiddleware extends Middleware {
    /**
     * HttpMiddleware constructor
     */
    constructor(request, response) {
        super(request.context);
    }
}
exports.HttpMiddleware = HttpMiddleware;
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
         *
         */
        this.middlewareHandlers = [];
        this.expressRouter = express.Router(options);
        this.options.prefix = misc_1._.trim(this.options.prefix || '', '/');
        this.options.namespace = misc_1._.trim(this.options.namespace || '', '/');
    }
    /**
     * Set global for this current Router instance
     */
    middleware(classNameOrHandler) {
        if (typeof classNameOrHandler == 'string') {
            classNameOrHandler = this.findMiddleware(classNameOrHandler);
        }
        this.middlewareHandlers.push(classNameOrHandler);
    }
    /**
     * Resolve and return middleware instance
     */
    findMiddleware(className) {
        const middlewareClass = misc_1._.requireClass(`${this.middlewareDir}/${className}`);
        if (!misc_1._.classExtends(middlewareClass, HttpMiddleware)) {
            throw new Error(`${className} doesn't extend HttpMiddleware`);
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
        if (!misc_1._.classExtends(controllerClass, HttpController)) {
            throw new Error(`${controllerName} doesn't extend HttpController`);
        }
        const middlewareHandlers = [];
        if (Array.isArray(middleware)) {
            for (let mware of middleware) {
                if (typeof mware == 'string') {
                    mware = this.findMiddleware(mware);
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
        this.expressRouter[method](this.prefix(path), this.middlewareHandlers.concat(middlewareHandlers));
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
    }
}
exports.Router = Router;
//# sourceMappingURL=routing.js.map