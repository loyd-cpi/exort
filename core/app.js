"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const misc_1 = require("./misc");
const express = require("express");
const store_1 = require("./store");
const pathlib = require("path");
const error_1 = require("./error");
/**
 * Config class
 */
class Config extends store_1.Store {
    /**
     * Load configuration files
     */
    static load(files) {
        let config = new Config();
        for (let file of files) {
            let content = require(file);
            if (!misc_1._.isNone(content) && typeof content == 'object') {
                for (let key in content) {
                    config.set(key, content[key]);
                }
            }
        }
        return config;
    }
}
exports.Config = Config;
/**
 * Initialize application instance and configure
 */
function createApplication(bootDir, configFiles) {
    const app = express();
    if (typeof app.rootDir != 'undefined') {
        throw new error_1.Error('app.rootDir is already set. There might be conflict with express');
    }
    if (typeof app.bootDir != 'undefined') {
        throw new error_1.Error('app.bootDir is already set. There might be conflict with express');
    }
    if (typeof app.dir != 'undefined') {
        throw new error_1.Error('app.dir is already set. There might be conflict with express');
    }
    if (typeof app.id != 'undefined') {
        throw new error_1.Error('app.id is already set. There might be conflict with express');
    }
    app.id = misc_1._.uniqueId('app:');
    app.testMode = false;
    app.rootDir = process.cwd();
    app.bootDir = pathlib.normalize(misc_1._.trimEnd(bootDir, '/'));
    app.dir = pathlib.dirname(app.bootDir);
    if (typeof configFiles == 'undefined') {
        configFiles = [`${app.dir}/config`];
    }
    else if (typeof configFiles == 'string') {
        configFiles = [configFiles];
    }
    configure(app, configFiles);
    return app;
}
exports.createApplication = createApplication;
/**
 * Set config object of application
 */
function configure(app, files) {
    if (typeof app.config != 'undefined') {
        if (app.config instanceof Config) {
            throw new error_1.Error('configure(app) is already called');
        }
        else {
            throw new error_1.Error('app.config already exists. there must be conflict with express');
        }
    }
    let config = app.config = Config.load(files);
    app.set('env', config.get('app.env'));
}
exports.configure = configure;
/**
 * Check if application has config object
 */
function checkAppConfig(app) {
    if (!(app.config instanceof Config)) {
        throw new error_1.Error('Should call configure(app) first');
    }
}
exports.checkAppConfig = checkAppConfig;
/**
 * Execute providers
 */
function boot(app) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        checkAppConfig(app);
        const BootstrapClass = misc_1._.requireClass(`${app.bootDir}/Bootstrap`);
        const bootstrap = new BootstrapClass(app);
        let providers = bootstrap.provide();
        if (!Array.isArray(providers)) {
            throw new error_1.Error('Bootstrap.provide() should return an array of AppProviders');
        }
        for (let provider of providers) {
            yield provider(app);
        }
    });
}
exports.boot = boot;
/**
 * Abstract AppBootstrap class
 */
class AppBootstrap {
    /**
     * AppBootstrap constructor
     */
    constructor(app) {
        this.app = app;
    }
}
exports.AppBootstrap = AppBootstrap;
//# sourceMappingURL=app.js.map