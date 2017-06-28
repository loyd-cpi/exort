import { Response } from './response';
import { Request } from './request';
import * as express from 'express';
import { Store, _ } from './misc';
import * as pathlib from 'path';

/**
 * Config class
 */
export class Config extends Store {

  /**
   * Load configuration files
   * @param  {string[]} files
   * @return {Config}
   */
  public static load(files: string[]): Config {
    let config = new Config();
    for (let file of files) {
      let content = require(file);
      if (!_.isNone(content.default)) {
        config.set(pathlib.basename(file), content.default);
      }
    }
    return config;
  }
}

/**
 * Set config object of application
 * @param  {T} app
 * @param  {string[]} files
 * @return {void}
 */
export function configure<T extends express.Server>(app: T, files: string[]): void {
  let config = app.locals.config = Config.load(files);
  app.set('env', config.get('app.env'));

  app.disable('x-powered-by');
  app.disable('strict routing');
  app.enable('case sensitive routing');

  app.use((req: Request, res: Response, next: express.NextFunction) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });
}

/**
 * Check if application has config object
 * @param  {T} app
 * @return {void}
 */
export function checkAppConfig<T extends express.Server>(app: T): void {
  if (!(app.locals.config instanceof Config)) {
    throw new Error('Should call configure(app) first');
  }
}

/**
 * AppProvider interface
 */
export interface AppProvider<T extends express.Server> {
  (app: T): Promise<void>;
}

/**
 * Execute providers and boot the application
 * @param  {U} app
 * @param  {AppProvider<U>} providers
 * @return {Promise<void>}
 */
export async function boot<U extends express.Server>(app: U, providers: AppProvider<U>[]): Promise<void> {
  for (let provider of providers) {
    await provider(app);
  }
}
