"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express = require("express");
const misc_1 = require("./misc");
/**
 * Config class
 */
class Config extends misc_1.Store {
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
function createApplication(rootDir, configFiles) {
    let app = express();
    if (typeof app.dir != 'undefined') {
        throw new Error('app.dir is already set. There must be conflict with express');
    }
    app.dir = misc_1._.trimEnd(rootDir, '/');
    if (typeof configFiles == 'string') {
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
 */
function checkAppConfig(app) {
    if (!(app.config instanceof Config)) {
        throw new Error('Should call configure(app) first');
    }
}
exports.checkAppConfig = checkAppConfig;
/**
 * Execute providers and boot the application
 */
function executeProviders(app, providers) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (let provider of providers) {
            yield provider(app);
        }
    });
}
exports.executeProviders = executeProviders;
//# sourceMappingURL=app.js.map