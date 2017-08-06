"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("./app");
const misc_1 = require("./misc");
const error_1 = require("./error");
/**
 * Bind a resolve function to solve circular dependency
 */
function Bind(resolver, options) {
    return (target, propertyKey) => {
        let serviceClass;
        Object.defineProperty(target, propertyKey, {
            get() {
                if (!serviceClass) {
                    serviceClass = resolver();
                }
                return this.context.make(serviceClass);
            }
        });
    };
}
exports.Bind = Bind;
/**
 * Context class
 */
class Context {
    /**
     * Context constructor
     */
    constructor(app) {
        this.app = app;
        /**
         * Store instance
         */
        this.store = new misc_1.Store();
        /**
         * Map of resolved instances
         */
        this.resolvedInstances = new Map();
        /**
         * Map of bindings
         */
        this.bindings = new Map();
    }
    /**
     * Create service instance
     */
    make(serviceClass) {
        if (this.resolvedInstances.has(serviceClass)) {
            return this.resolvedInstances.get(serviceClass);
        }
        this.checkIfServiceClass(serviceClass);
        let instance;
        if (this.bindings.has(serviceClass)) {
            instance = this.bindings.get(serviceClass)(this);
        }
        else {
            instance = Reflect.construct(serviceClass, [this]);
        }
        this.remember(serviceClass, instance);
        return instance;
    }
    /**
     * Provide custom way of resolving an instance for a service
     */
    bind(serviceClass, closure) {
        this.checkIfServiceClass(serviceClass);
        this.bindings.set(serviceClass, closure);
    }
    /**
     * Remember resolved instance and save it for future make() calls
     */
    remember(serviceClass, instance) {
        this.checkIfServiceClass(serviceClass);
        this.resolvedInstances.set(serviceClass, instance);
    }
    /**
     * Check if given class extends Service class
     */
    checkIfServiceClass(serviceClass) {
        if (!misc_1._.classExtends(serviceClass, Service)) {
            throw new error_1.Error(`${serviceClass.name} is not a Service class`);
        }
    }
    /**
     * Create new instance with app instance
     */
    newInstance() {
        return Reflect.construct(this.constructor, [this.app]);
    }
}
exports.Context = Context;
/**
 * Provider service context
 */
function provideServices() {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        app.context = new Context(app);
        app.use((req, res, next) => {
            if (!(req.context instanceof Context) || typeof req.make != 'function') {
                req.context = new Context(app);
                req.make = req.context.make.bind(req.context);
            }
            next();
        });
    });
}
exports.provideServices = provideServices;
/**
 * Abstract Service class
 */
class Service {
    /**
     * Service constructor
     */
    constructor(context) {
        this.context = context;
        this.app = context.app;
    }
    /**
     * Create instance of given Service class. Just like what req.make() does
     */
    make(serviceClass) {
        return this.context.make(serviceClass);
    }
}
exports.Service = Service;
/**
 * ServiceError class
 */
class ServiceError extends error_1.Error {
    /**
     * ServiceError constructor
     */
    constructor(message) {
        super(message);
    }
}
exports.ServiceError = ServiceError;
//# sourceMappingURL=service.js.map