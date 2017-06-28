import * as express from 'express';
/**
 * Setup routes
 * @param  {express.Server} app
 * @param  {string} routesFile
 * @return {void}
 */
export declare function installRoutes<T extends express.Server>(app: T, routesFile: string): void;
