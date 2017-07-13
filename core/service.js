"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const misc_1 = require("./misc");
/**
 * Decorator to make an injectable class
 */
function Injectable() {
    return (target) => {
        if (typeof target != 'function') {
            throw new Error(`${typeof target} cannot be injectable`);
        }
        target.$injectParamNames = misc_1._.getConstructorParamNames(target);
    };
}
exports.Injectable = Injectable;
/**
 * Check if class is injectable
 */
function isInjectable(targetClass) {
    if (typeof targetClass != 'function') {
        throw new Error('Invalid target class');
    }
    return Array.isArray(targetClass.$injectParamNames);
}
exports.isInjectable = isInjectable;
/**
 * Bind a resolve function to solve circular dependency
 */
function Bind(resolver) {
    return (target, propertyKey, parameterIndex) => {
        misc_1.Metadata.set(target, `bind:${parameterIndex}`, resolver);
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
         * Map of resolved instances
         */
        this.resolvedInstances = new Map();
        this.resolvedInstances.set(Context, this);
    }
    /**
     * create instance via dependency injection and using this context
     */
    make(serviceClass) {
        if (this.resolvedInstances.has(serviceClass)) {
            return this.resolvedInstances.get(serviceClass);
        }
        if (!isInjectable(serviceClass)) {
            throw new Error(`${serviceClass.name} is not an injectable class`);
        }
        if (!misc_1._.classExtends(serviceClass, Service)) {
            throw new Error(`${serviceClass.name} is not a Service class`);
        }
        let params = [];
        if (Reflect.hasMetadata('design:paramtypes', serviceClass)) {
            let paramTypes = Reflect.getMetadata('design:paramtypes', serviceClass);
            for (let paramIndex in paramTypes) {
                if (misc_1._.isNone(paramTypes[paramIndex])) {
                    let resolve = misc_1.Metadata.get(serviceClass, `bind:${paramIndex}`);
                    if (typeof resolve != 'function') {
                        throw new Error(`Param type of ${serviceClass.$injectParamNames[paramIndex]} in ${serviceClass.name} constructor is empty. ` +
                            `It might be caused by circular dependency`);
                    }
                    let resolvedClass = resolve();
                    if (misc_1._.isNone(resolvedClass)) {
                        throw new Error(`Binding for ${serviceClass.$injectParamNames[paramIndex]} in ${serviceClass.name} constructor returns empty. `);
                    }
                    paramTypes[paramIndex] = resolvedClass;
                }
                params.push(this.make(paramTypes[paramIndex]));
            }
        }
        if (!params.length) {
            params.push(this);
        }
        let instance = Reflect.construct(serviceClass, params);
        this.resolvedInstances.set(serviceClass, instance);
        return instance;
    }
}
exports.Context = Context;
/**
 * Provider service context
 */
function provideServices() {
    return (app) => __awaiter(this, void 0, void 0, function* () {
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
    }
    /**
     * Create instance of given Service class. Just like what req.make() does
     */
    make(serviceClass) {
        return this.context.make(serviceClass);
    }
}
exports.Service = Service;
//# sourceMappingURL=service.js.map