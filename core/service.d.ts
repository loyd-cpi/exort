import { Application, AppProvider } from './app';
/**
 * Decorator to make an injectable class
 */
export declare function Injectable(): (target: Function) => void;
/**
 * Check if class is injectable
 */
export declare function isInjectable(targetClass: Function): boolean;
/**
 * Context class
 */
export declare class Context {
    readonly app: Application;
    /**
     * Map of resolved instances
     */
    private resolvedInstances;
    /**
     * Context constructor
     */
    constructor(app: Application);
    /**
     * create instance via dependency injection and using this context
     */
    make<U extends Service>(serviceClass: new (...args: any[]) => U): U;
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
     * Service constructor
     */
    constructor(context: Context);
}
