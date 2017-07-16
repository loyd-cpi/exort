import { AppProvider } from './app';
import * as express from 'express';
/**
 * Provide routes
 */
export declare function provideRoutes(routesFile: string): AppProvider;
/**
 * RouterOptions interface
 */
export interface RouterOptions extends express.RouterOptions {
}
/**
 * Router namespace
 */
export declare namespace Router {
    /**
     * Create new instance of express.Router
     */
    function create(options?: express.RouterOptions): express.Router;
}
