import * as dotenv from 'dotenv';
import * as yargs from 'yargs';
import { _ } from './misc';

/**
 * Load environment file
 * @param {string} envFile
 */
export function loadEnvironmentFromDir(directory: string) {
  dotenv.config({ path: `${_.trimEnd(directory, '/')}/.env`, silent: true });
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
