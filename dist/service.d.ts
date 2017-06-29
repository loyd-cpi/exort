import { Connection } from 'typeorm';
import { BaseApplication } from './app';
/**
 * ServiceContext class
 */
export declare class ServiceContext {
    /**
     * Map of resolved instances
     * @type {Map<string, any>}
     */
    private resolvedInstances;
    /**
     * create instance via dependency injection and using this context
     * @param  {(new(...args: any[]) => U)} serviceClass
     * @return {U}
     */
    make<U extends Service>(serviceClass: new (...args: any[]) => U): U;
}
/**
 * ServiceClassResolver interface
 */
export interface ServiceClassResolver<U extends Service> {
    (type?: any): new (...args: any[]) => U;
}
/**
 * Decorator for injecting service dependencies
 * @param  {ServiceClassResolver} resolver
 * @return {((target: Object, propertyKey: string) => void)}
 */
export declare function Inject<U extends Service>(resolver: ServiceClassResolver<U>): ((target: Object, propertyKey: string) => void);
/**
 * Install services
 * @param  {T} app
 * @return {void}
 */
export declare function installServices<T extends BaseApplication>(app: T): void;
/**
 * Abstract Service class
 */
export declare abstract class Service {
    protected context: ServiceContext;
    /**
     * Service constructor
     * @param {ServiceContext} context
     */
    constructor(context: ServiceContext);
}
/**
 * Abstract SQLService class
 */
export declare abstract class SQLService extends Service {
    /**
     * Gets registered connection with the given name.
     * If connection name is not given then it will get a default connection.
     * Throws exception if connection with the given name was not found.
     * @param  {string} name
     * @return {Connection}
     */
    connection(name?: string): Connection;
}
