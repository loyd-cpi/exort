import { AppProvider } from '../core/app';
import * as express from 'express';
/**
 * Provide routes
 */
export declare function provideRoutes(routesFile: string, controllersDir: string, middlewareDir: string): AppProvider;
/**
 * RouterOptions interface
 */
export interface RouterOptions extends express.RouterOptions {
}
/**
 * RouterOptions interfaces
 */
export interface RouterOptions extends express.RouterOptions {
    prefix?: string;
    namespace?: string;
}
/**
 * RouteGroupOptions interface
 */
export interface RouteGroupOptions {
    prefix?: string;
    namespace?: string;
}
/**
 * RouteGroupClosure interface
 */
export interface RouteGroupClosure {
    (router: Router): void;
}
/**
 * Router class
 */
export declare class Router {
    private options;
    private controllersDir;
    private middlewareDir;
    /**
     * Express router instance
     */
    private expressRouter;
    /**
     *
     */
    private middlewareHandlers;
    /**
     * Router constructor
     */
    constructor(options: RouterOptions, controllersDir: string, middlewareDir: string);
    /**
     * Get express.Router
     */
    getExpressRouter(): express.Router;
    /**
     * Set global for this current Router instance
     */
    middleware(handler: express.RequestHandler): void;
    /**
     * Set global for this current Router instance
     */
    middleware(className: string): void;
    /**
     * Resolve and return middleware instance
     */
    private findMiddleware(className);
    /**
     * Set route using custom method
     */
    route(method: string, path: string, controller: string, middleware?: (string | express.RequestHandler)[]): void;
    /**
     * Apply prefix
     */
    private prefix(path);
    /**
     * Apply namespace
     */
    private namespace(path);
    /**
     * Set GET route method
     */
    get(path: string, controller: string, middleware?: string[]): void;
    /**
     * Set POST route method
     */
    post(path: string, controller: string, middleware?: string[]): void;
    /**
     * Set PUT route method
     */
    put(path: string, controller: string, middleware?: string[]): void;
    /**
     * Set DELETE route method
     */
    delete(path: string, controller: string, middleware?: string[]): void;
    /**
     * Create route group
     */
    group(closure: RouteGroupClosure): void;
    /**
     * Create route group
     */
    group(options: RouteGroupOptions, closure: RouteGroupClosure): void;
}
