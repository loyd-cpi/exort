"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("../core/app");
const favicon = require("serve-favicon");
const express = require("express");
const misc_1 = require("../core/misc");
const pathlib = require("path");
/**
 * Install assets
 */
function provideAssets() {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        let assetsConf = app.config.get('assets');
        if (!assetsConf)
            return;
        assetsConf.paths.forEach((conf) => {
            if (!conf || !conf.prefix || !conf.path) {
                throw new Error('Each item in assets.paths config requires prefix and path');
            }
            conf.prefix = `/${misc_1._.trim(conf.prefix, '/')}`;
            if (!pathlib.isAbsolute(conf.path)) {
                conf.path = `${app.dir}${conf.path}`;
            }
            app.use(conf.prefix, express.static(conf.path, conf.options || {}));
        });
    });
}
exports.provideAssets = provideAssets;
/**
 * Provide favicon
 */
function provideFavicon(faviconPath) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        if (!pathlib.isAbsolute(faviconPath)) {
            faviconPath = pathlib.join(app.rootDir, faviconPath);
        }
        app.use(favicon(faviconPath, app.config.get('assets.favicon')));
    });
}
exports.provideFavicon = provideFavicon;
//# sourceMappingURL=assets.js.map