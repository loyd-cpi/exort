import { checkAppConfig } from './boot';
import * as express from 'express';

/**
 * Setup routes
 * @param  {express.Server} app
 * @param  {string} routesFile
 * @return {void}
 */
export function installRoutes<T extends express.Server>(app: T, routesFile: string): void {
  checkAppConfig(app);

  let routes = require(routesFile);
  if (typeof routes != 'object') {
    throw new Error('Invalid routes file');
  }

  if (typeof routes.setup == 'function') {
    routes.setup(app);
  }
}
