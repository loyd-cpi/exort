import { Context } from './service';
import * as express from 'express';
import { Store, _ } from './misc';
import * as pathlib from 'path';

/**
 * Application interface
 */
export interface Application extends express.Server {

  /**
   * Config instance
   * @type {Config}
   */
  readonly config: Config;

  /**
   * Application root directory
   * @type {string}
   */
  readonly dir: string;

  /**
   * Single instance of context.
   * Don't use this to create service instance per request
   * @type {Context}
   */
  readonly context: Context;
}

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
 * Initialize application instance and configure
 * @param  {string} rootDir
 * @param  {string[]} configFiles
 * @return {Application}
 */
export function createApplication(rootDir: string, configFiles: string[]): Application {
  let app = express() as Application;
  if (typeof app.dir != 'undefined') {
    throw new Error('app.dir is already set. There must be conflict with express');
  }
  (app as any).dir = _.trimEnd(rootDir, '/');
  configure(app, configFiles);
  return app;
}

/**
 * Set config object of application
 * @param  {Application} app
 * @param  {string[]} files
 * @return {void}
 */
export function configure(app: Application, files: string[]): void {
  if (typeof app.config != 'undefined') {
    if (app.config instanceof Config) {
      throw new Error('configure(app) is already called');
    } else {
      throw new Error('app.config already exists. there must be conflict with express');
    }
  }

  let config = (app as any).config = Config.load(files);
  app.set('env', config.get('app.env'));
}

/**
 * Check if application has config object
 * @param  {Application} app
 * @return {void}
 */
export function checkAppConfig(app: Application): void {
  if (!(app.config instanceof Config)) {
    throw new Error('Should call configure(app) first');
  }
}

/**
 * AppProvider interface
 */
export interface AppProvider {
  (app: Application): Promise<void>;
}

/**
 * Execute providers and boot the application
 * @param  {Application} app
 * @param  {AppProvider[]} providers
 * @return {Promise<void>}
 */
export async function executeProviders(app: Application, providers: AppProvider[]): Promise<void> {
  for (let provider of providers) {
    await provider(app);
  }
}
