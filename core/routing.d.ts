import { AppProvider } from './app';
import { Request, Input, Response } from './http';
import { Context } from './service';
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
 * Abstract Controller class
 */
export declare abstract class Controller {
    protected readonly context: Context;
    /**
     * Controller constructor
     */
    constructor(context: Context);
}
/**
 * Abstract HttpController class
 */
export declare abstract class HttpController extends Controller {
    protected readonly request: Request;
    protected readonly response: Response;
    /**
     * HttpController constructor
     */
    constructor(request: Request, response: Response);
    /**
     * Getter for request.input
     */
    protected readonly input: Input;
}
/**
 * Abstract Middleware class
 */
export declare abstract class Middleware {
    protected readonly context: Context;
    /**
     * Middleware constructor
     */
    constructor(context: Context);
}
/**
 * HttpMiddleware class
 */
export declare abstract class HttpMiddleware extends Middleware {
    protected readonly request: Request;
    protected readonly response: Response;
    /**
     * HttpMiddleware constructor
     */
    constructor(request: Request, response: Response);
    /**
     * Abstract handle method
     */
    abstract handle(next: express.NextFunction): Promise<void>;
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
