"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const morgan = require("morgan");
const misc_1 = require("./misc");
/**
 * Install logger middleware
 * @param  {T} app
 * @return {void}
 */
function installLogger(app) {
    app_1.checkAppConfig(app);
    let format = 'short';
    let options = {};
    let logConf = app.locals.config.get('logger');
    if (logConf) {
        if (logConf.includeAssets === false) {
            let prefixes = [];
            for (let conf of app.locals.config.get('assets')) {
                if (conf.prefix)
                    prefixes.push(`/${misc_1._.trim(conf.prefix, '/')}`);
            }
            if (prefixes.length) {
                options.skip = (req, res) => {
                    for (let prefix of prefixes) {
                        if (misc_1._.startsWith(req.baseUrl, prefix))
                            return true;
                    }
                    return false;
                };
            }
        }
        if (typeof logConf.format != 'undefined') {
            format = logConf.format;
        }
    }
    app.use(morgan(format, options));
}
exports.installLogger = installLogger;
//# sourceMappingURL=logger.js.map