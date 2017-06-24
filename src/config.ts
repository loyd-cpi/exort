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
 * @param  {express.Application} app
 * @param  {string[]} files
 * @return {void}
 */
export function installConfig(app: express.Application, files: string[]): void {
  app.locals.config = Config.load(files);
}

/**
 * Check if application has config object
 * @param  {express.Application} app
 * @return {void}
 */
export function checkAppConfig(app: express.Application): void {
  if (!(app.locals.config instanceof Config)) {
    throw new Error('Must do installConfig(app) first');
  }
}
