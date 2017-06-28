"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boot_1 = require("./boot");
const favicon = require("serve-favicon");
const express = require("express");
const pathlib = require("path");
const misc_1 = require("./misc");
/**
 * Install assets
 * @param  {T} app
 * @param  {string} rootDir
 * @return {void}
 */
function installAssets(app, rootDir) {
    boot_1.checkAppConfig(app);
    let config = app.locals.config;
    let assetsConf = config.get('assets');
    if (!assetsConf)
        return;
    rootDir = misc_1._.trimEnd(rootDir, '/');
    assetsConf.paths.forEach((conf) => {
        if (!conf || !conf.prefix || !conf.path) {
            throw new Error('Each item in assets.paths config requires prefix and path');
        }
        conf.prefix = `/${misc_1._.trim(conf.prefix, '/')}`;
        if (!pathlib.isAbsolute(conf.path)) {
            conf.path = `${rootDir}${conf.path}`;
        }
        app.use(conf.prefix, express.static(conf.path, conf.options || {}));
    });
}
exports.installAssets = installAssets;
/**
 * Install app favicon
 * @param  {T} app
 * @param  {string} faviconPath
 * @return {void}
 */
function installFavicon(app, faviconPath) {
    boot_1.checkAppConfig(app);
    app.use(favicon(faviconPath, app.locals.config.get('assets.favicon')));
}
exports.installFavicon = installFavicon;
//# sourceMappingURL=assets.js.map