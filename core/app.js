"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const misc_1 = require("./misc");
const pathlib = require("path");
/**
 * Config class
 */
class Config extends misc_1.Store {
    /**
     * Load configuration files
     * @param  {string[]} files
     * @return {Config}
     */
    static load(files) {
        let config = new Config();
        for (let file of files) {
            let content = require(file);
            if (!misc_1._.isNone(content.default)) {
                config.set(pathlib.basename(file), content.default);
            }
        }
        return config;
    }
}
exports.Config = Config;
/**
 * Initialize application instance and configure
 * @param  {string} rootDir
 * @param  {string[]} configFiles
 * @return {Application}
 */
function createApplication(rootDir, configFiles) {
    let app = express();
    if (typeof app.dir != 'undefined') {
        throw new Error('app.dir is already set. There must be conflict with express');
    }
    app.dir = misc_1._.trimEnd(rootDir, '/');
    configure(app, configFiles);
    return app;
}
exports.createApplication = createApplication;
/**
 * Set config object of application
 * @param  {Application} app
 * @param  {string[]} files
 * @return {void}
 */
function configure(app, files) {
    if (typeof app.config != 'undefined') {
        if (app.config instanceof Config) {
            throw new Error('configure(app) is already called');
        }
        else {
            throw new Error('app.config already exists. there must be conflict with express');
        }
    }
    let config = app.config = Config.load(files);
    app.set('env', config.get('app.env'));
}
exports.configure = configure;
/**
 * Check if application has config object
 * @param  {Application} app
 * @return {void}
 */
function checkAppConfig(app) {
    if (!(app.config instanceof Config)) {
        throw new Error('Should call configure(app) first');
    }
}
exports.checkAppConfig = checkAppConfig;
/**
 * Execute providers and boot the application
 * @param  {Application} app
 * @param  {AppProvider[]} providers
 * @return {Promise<void>}
 */
function executeProviders(app, providers) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let provider of providers) {
            yield provider(app);
        }
    });
}
exports.executeProviders = executeProviders;
//# sourceMappingURL=app.js.map