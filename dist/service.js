"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const boot_1 = require("./boot");
const misc_1 = require("./misc");
/**
 * ServiceContext class
 */
class ServiceContext {
    constructor() {
        /**
         * Map of resolved instances
         * @type {Map<string, any>}
         */
        this.resolvedInstances = new Map();
    }
    /**
     * create instance via dependency injection and using this context
     * @param  {new(...args: any[]) => U} serviceClass
     * @return {U}
     */
    make(serviceClass) {
        if (this.resolvedInstances.has(serviceClass)) {
            return this.resolvedInstances.get(serviceClass);
        }
        if (!misc_1._.classExtends(serviceClass, Service)) {
            throw new Error(`${serviceClass.name} is not a Service class`);
        }
        let instance = Reflect.construct(serviceClass, [this]);
        this.resolvedInstances.set(serviceClass, instance);
        return instance;
    }
}
exports.ServiceContext = ServiceContext;
/**
 * Decorator for injecting service dependencies
 * @param  {(type?: any) => new(...args: any[]) => U} resolver
 * @return {(target: Object, propertyKey: string) => void}
 */
function Inject(resolver) {
    return (target, propertyKey) => {
    };
}
exports.Inject = Inject;
/**
 * Install services
 * @param  {T} app
 * @return {void}
 */
function installServices(app) {
    boot_1.checkAppConfig(app);
    app.use((req, res, next) => {
        if (!(req.serviceContext instanceof ServiceContext) || typeof req.make != 'function') {
            req.serviceContext = new ServiceContext();
            req.make = req.serviceContext.make.bind(req.serviceContext);
        }
        next();
    });
}
exports.installServices = installServices;
/**
 * Abstract Service class
 */
class Service {
    /**
     * Service constructor
     * @param {ServiceContext} context
     */
    constructor(context) {
        this.context = context;
    }
}
exports.Service = Service;
/**
 * Abstract SQLService class
 */
class SQLService extends Service {
    /**
     * Gets registered connection with the given name.
     * If connection name is not given then it will get a default connection.
     * Throws exception if connection with the given name was not found.
     * @param  {string} name
     * @return {Connection}
     */
    connection(name = 'default') {
        return typeorm_1.getConnectionManager().get(name);
    }
}
exports.SQLService = SQLService;
//# sourceMappingURL=service.js.map