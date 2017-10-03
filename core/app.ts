import { KeyValuePair, _ } from './misc';
import { Context } from './service';
import * as express from 'express';
import { Store } from './store';
import * as pathlib from 'path';
import { Error } from './error';

/**
 * Application interface
 */
export interface Application extends express.Express {

  /**
   * Application ID
   * @type {string}
   */
  readonly id: string;

  /**
   * Config instance
   */
  readonly config: Config;

  /**
   * Application directory which contains models and services directory
   */
  readonly dir: string;

  /**
   * Root or the current working directory
   */
  readonly rootDir: string;

  /**
   * Boot directory ex. http folder or console folder
   */
  readonly bootDir: string;

  /**
   * Single instance of context.
   * Don't use this to create service instance per request
   */
  readonly context: Context;

  /**
   * Determine if the application instance is for testing
   */
  readonly testMode: boolean;

  /**
   * Render the given view `name` name
   *
   * Example:
   *
   *   let html = await app.render('email')
   */
  render(name: string): Promise<string>;

  /**
   * Render the given view `name` name
   * and a callback accepting an error and the
   * rendered template string.
   *
   * Example:
   *
   *   app.render('email', function (err, html) {
   *     // ...
   *   })
   */
  render(name: string, callback: (err: Error, html: string) => void): void;

  /**
   * Render the given view `name` name with `options`
   *
   * Example:
   *
   *   let html = await app.render('email', { name: 'Tobi' })
   */
  render(name: string, options: KeyValuePair): Promise<string>;

  /**
   * Render the given view `name` name with `options`
   * and a callback accepting an error and the
   * rendered template string.
   *
   * Example:
   *
   *   app.render('email', { name: 'Tobi' }, function (err, html) {
   *     // ...
   *   })
   */
  render(name: string, options: KeyValuePair, callback: (err: Error, html: string) => void): void;
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
      if (!_.isNone(content) && typeof content == 'object') {

        for (let key in content) {
          config.set(key, content[key]);
        }
      }
    }

    return config;
  }
}

/**
 * Initialize application instance and configure
 */
export function createApplication(bootDir: string, configFile?: string): Application;

/**
 * Initialize application instance and configure
 */
export function createApplication(bootDir: string, configFiles?: string[]): Application;

/**
 * Initialize application instance and configure
 */
export function createApplication(bootDir: string, configFiles?: string | string[]): Application {
  const app = express() as Application;
  if (typeof app.rootDir != 'undefined') {
    throw new Error('app.rootDir is already set. There might be conflict with express');
  }

  if (typeof app.bootDir != 'undefined') {
    throw new Error('app.bootDir is already set. There might be conflict with express');
  }

  if (typeof app.dir != 'undefined') {
    throw new Error('app.dir is already set. There might be conflict with express');
  }

  if (typeof app.id != 'undefined') {
    throw new Error('app.id is already set. There might be conflict with express');
  }

  (app as any).id = _.uniqueId('app:');
  (app as any).testMode = false;
  (app as any).rootDir = process.cwd();
  (app as any).bootDir = pathlib.normalize(_.trimEnd(bootDir, '/'));
  (app as any).dir = pathlib.dirname(app.bootDir);

  if (typeof configFiles == 'undefined') {
    configFiles = [`${app.dir}/config`];
  } else if (typeof configFiles == 'string') {
    configFiles = [configFiles];
  }

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

  const config = (app as any).config = Config.load(files);
  process.env.TZ = config.get('app.timezone');
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
 * Execute providers
 */
export async function boot(app: Application): Promise<void> {
  checkAppConfig(app);

  const BootstrapClass = _.requireClass(`${app.bootDir}/Bootstrap`) as new(app: Application) => AppBootstrap;
  const bootstrap = new BootstrapClass(app);

  let providers = bootstrap.provide();
  if (!Array.isArray(providers)) {
    throw new Error('Bootstrap.provide() should return an array of AppProviders');
  }

  for (let provider of providers) {
    await provider(app);
  }
}

/**
 * Abstract AppBootstrap class
 */
export abstract class AppBootstrap {

  /**
   * AppBootstrap constructor
   */
  constructor(protected readonly app: Application) {}

  /**
   * Abstract provide method
   */
  public abstract provide(): AppProvider[];
}
