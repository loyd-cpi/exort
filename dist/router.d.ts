import { BaseApplication } from './app';
/**
 * Setup routes
 * @param  {express.Server} app
 * @param  {string} routesFile
 * @return {void}
 */
export declare function installRoutes<T extends BaseApplication>(app: T, routesFile: string): void;
