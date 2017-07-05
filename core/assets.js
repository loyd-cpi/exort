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
const app_1 = require("./app");
const favicon = require("serve-favicon");
const express = require("express");
const pathlib = require("path");
const misc_1 = require("./misc");
/**
 * Install assets
 * @return {AppProvider}
 */
function provideAssets() {
    return (app) => __awaiter(this, void 0, void 0, function* () {
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
 * @param  {string} faviconPath
 * @return {AppProvider}
 */
function provideFavicon(faviconPath) {
    return (app) => __awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        app.use(favicon(faviconPath, app.config.get('assets.favicon')));
    });
}
exports.provideFavicon = provideFavicon;
//# sourceMappingURL=assets.js.map