import * as dotenv from 'dotenv';
import * as yargs from 'yargs';
import { _ } from './misc';
import * as fs from 'fs';

/**
 * Load environment file and setup namespace
 * @param  {string} directory
 * @return {void}
 */
export function setupEnvironmentAndNamespace(directory: string): void {
  directory = _.trimEnd(directory, '/');
  dotenv.config({ path: `${directory}/.env`, silent: true });

  try {
    fs.mkdirSync(`${directory}/node_modules`);
  } catch (e) {}

  try {
    fs.unlinkSync(`${directory}/node_modules/app`);
  } catch (e) {
    if (e.code != 'ENOENT') {
      throw e;
    }
  }

  try {
    fs.symlinkSync('../dist', `${directory}/node_modules/app`);
  } catch (e) {
    if (e.code != 'ENOENT' && e.code != 'EEXIST') {
      throw e;
    }
  }
}

/**
 * Get environment value
 * @param  {string} key
 * @param  {any} defaultVal
 * @return {any}
 */
export function env(key: string, defaultVal?: any): any {
  if (typeof process.env[key] == 'undefined' && typeof defaultVal != 'undefined') {
    return defaultVal;
  }

  let env = process.env[key];
  if (typeof env == 'string' && ['null', 'true', 'false'].indexOf(env) != -1) {
    env = eval(env);
  }

  return env;
}

/**
 * Get CLI argument
 * @param  {string} key
 * @param  {any} defaultVal
 * @return {any}
 */
export function argument(key: string, defaultVal?: any): any {
  return _.defaultIfNone(yargs.argv[key], defaultVal);
}
