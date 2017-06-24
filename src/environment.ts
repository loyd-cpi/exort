import { KeyValuePair, _ } from './misc';
import * as dotenv from 'dotenv';

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
 * Contains the parsed CLI arguments
 * @type {KeyValuePair<any>}
 */
const CLI_ARGS: KeyValuePair<any> = {};

/**
 * Parse CLI arguments then save
 */
function parseCLIArguments(): void {
  let args = process.argv.slice(2);
  for (let arg of args) {
    if (arg.indexOf('--') !== 0) {
      continue;
    }
    let parts = _.split(_.trimStart(arg, '-'), '=', 2);
    CLI_ARGS[parts[0]] = parts[1];
  }
}

parseCLIArguments();

/**
 * Get CLI argument
 * @param  {string} key
 * @param  {any} defaultVal
 * @return {any}
 */
export function argument(key: string, defaultVal?: any): any {
  return _.defaultIfNone(CLI_ARGS[key], defaultVal);
}
