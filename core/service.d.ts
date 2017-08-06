import { Application, AppProvider } from './app';
import { Store } from './misc';
import { Error } from './error';
/**
 * BindOptions interface
 */
export interface BindOptions {
}
/**
 * Bind a resolve function to solve circular dependency
 */
export declare function Bind(resolver: ServiceClassResolver, options?: BindOptions): (target: Object, propertyKey: string) => void;
/**
 * Context class
 */
export declare class Context {
    readonly app: Application;
    /**
     * Store instance
     */
    readonly store: Store;
    /**
     * Map of resolved instances
     */
    private resolvedInstances;
    /**
     * Map of bindings
     */
    private bindings;
    /**
     * Context constructor
     */
    constructor(app: Application);
    /**
     * Create service instance
     */
    make<U extends Service>(serviceClass: new (...args: any[]) => U): U;
    /**
     * Provide custom way of resolving an instance for a service
     */
    bind<U extends Service>(serviceClass: new (...args: any[]) => U, closure: (context: Context) => U): void;
    /**
     * Remember resolved instance and save it for future make() calls
     */
    remember<U extends Service>(serviceClass: new (...args: any[]) => U, instance: U): void;
    /**
     * Check if given class extends Service class
     */
    private checkIfServiceClass<U>(serviceClass);
    /**
     * Create new instance with app instance
     */
    newInstance(): Context;
}
/**
 * ServiceClass interface
 */
export interface ServiceClass {
    new (...args: any[]): Service;
}
/**
 * ServiceClassResolver interface
 */
export interface ServiceClassResolver {
    (type?: any): ServiceClass;
}
/**
 * Provider service context
 */
export declare function provideServices(): AppProvider;
/**
 * Abstract Service class
 */
export declare abstract class Service {
    protected readonly context: Context;
    /**
     * Application instance
     */
    protected readonly app: Application;
    /**
     * Service constructor
     */
    constructor(context: Context);
    /**
     * Create instance of given Service class. Just like what req.make() does
     */
    protected make<U extends Service>(serviceClass: new (...args: any[]) => U): U;
}
/**
 * ServiceError class
 */
export declare class ServiceError extends Error {
    /**
     * ServiceError constructor
     */
    constructor(message: string);
}
