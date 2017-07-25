"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const yargs = require("yargs");
const misc_1 = require("./misc");
const fs = require("fs");
/**
 * Load environment file and setup namespace
 */
function setupEnvironmentAndNamespace(directory) {
    if (directory) {
        directory = misc_1._.trimEnd(directory, '/');
    }
    else {
        directory = process.cwd();
    }
    dotenv.config({ path: `${directory}/.env` });
    try {
        fs.mkdirSync(`${directory}/node_modules`);
    }
    catch (e) { }
    try {
        fs.unlinkSync(`${directory}/node_modules/app`);
    }
    catch (e) {
        if (e.code != 'ENOENT') {
            throw e;
        }
    }
    try {
        fs.symlinkSync('../dist', `${directory}/node_modules/app`);
    }
    catch (e) {
        if (e.code != 'ENOENT' && e.code != 'EEXIST') {
            throw e;
        }
    }
}
exports.setupEnvironmentAndNamespace = setupEnvironmentAndNamespace;
/**
 * Get environment value
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
 */
function argument(key, defaultVal) {
    return misc_1._.defaultIfNone(yargs.argv[key], defaultVal);
}
exports.argument = argument;
//# sourceMappingURL=environment.js.map