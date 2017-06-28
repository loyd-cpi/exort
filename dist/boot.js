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
 * Set config object of application
 * @param  {T} app
 * @param  {string[]} files
 * @return {void}
 */
function configure(app, files) {
    let config = app.locals.config = Config.load(files);
    app.set('env', config.get('app.env'));
    app.disable('x-powered-by');
    app.disable('strict routing');
    app.enable('case sensitive routing');
    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
    });
}
exports.configure = configure;
/**
 * Check if application has config object
 * @param  {T} app
 * @return {void}
 */
function checkAppConfig(app) {
    if (!(app.locals.config instanceof Config)) {
        throw new Error('Should call configure(app) first');
    }
}
exports.checkAppConfig = checkAppConfig;
/**
 * Execute providers and boot the application
 * @param  {U} app
 * @param  {AppProvider<U>} providers
 * @return {Promise<void>}
 */
function boot(app, providers) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let provider of providers) {
            yield provider(app);
        }
    });
}
exports.boot = boot;
//# sourceMappingURL=boot.js.map