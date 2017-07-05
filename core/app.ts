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
   */
  readonly config: Config;

  /**
   * Application root directory
   */
  readonly dir: string;

  /**
   * Single instance of context.
   * Don't use this to create service instance per request
   */
  readonly context: Context;
}

/**
 * Config class
 */
export class Config extends Store {

  /**
   * Load configuration files
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
 */
export async function executeProviders(app: Application, providers: AppProvider[]): Promise<void> {
  for (let provider of providers) {
    await provider(app);
  }
}
