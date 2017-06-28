"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const yargs = require("yargs");
const misc_1 = require("./misc");
/**
 * Load environment file
 * @param {string} envFile
 */
function loadEnvironmentFromDir(directory) {
    dotenv.config({ path: `${misc_1._.trimEnd(directory, '/')}/.env`, silent: true });
}
exports.loadEnvironmentFromDir = loadEnvironmentFromDir;
/**
 * Get environment value
 * @param  {string} key
 * @param  {any} defaultVal
 * @return {any}
 */
function env(key, defaultVal) {
    if (typeof process.env[key] == 'undefined' && typeof defaultVal != 'undefined') {
        return defaultVal;
    }
    let env = process.env[key];
    if (typeof env == 'string' && ['null', 'true', 'false'].indexOf(env) != -1) {
        env = eval(env);
    }
    return env;
}
exports.env = env;
/**
 * Get CLI argument
 * @param  {string} key
 * @param  {any} defaultVal
 * @return {any}
 */
function argument(key, defaultVal) {
    return misc_1._.defaultIfNone(yargs.argv[key], defaultVal);
}
exports.argument = argument;
//# sourceMappingURL=environment.js.map