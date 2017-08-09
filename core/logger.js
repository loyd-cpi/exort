"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("./app");
const morgan = require("morgan");
const misc_1 = require("./misc");
/**
 * Provide logger
 */
function provideLogger() {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        if (app.testMode)
            return;
        let format = 'short';
        let options = {};
        let logConf = app.config.get('logger');
        if (logConf) {
            if (logConf.includeAssets === false) {
                let prefixes = [];
                for (let conf of app.config.get('assets')) {
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
    });
}
exports.provideLogger = provideLogger;
/**
 * Log namespace
 */
var Log;
(function (Log) {
    /**
     * Log type enum
     */
    let Type;
    (function (Type) {
        Type["DEBUG"] = "debug";
        Type["ERROR"] = "error";
        Type["INFO"] = "info";
        Type["WARN"] = "warn";
    })(Type = Log.Type || (Log.Type = {}));
    /**
     * write console log
     */
    function write(app, message, type) {
        if (app.testMode)
            return;
        console[type](message);
    }
    /**
     * error console log
     */
    function error(app, message) {
        write(app, message, Type.ERROR);
    }
    Log.error = error;
    /**
     * debug console log
     */
    function debug(app, message) {
        write(app, message, Type.DEBUG);
    }
    Log.debug = debug;
    /**
     * info console log
     */
    function info(app, message) {
        write(app, message, Type.INFO);
    }
    Log.info = info;
    /**
     * warning console log
     */
    function warning(app, message) {
        write(app, message, Type.WARN);
    }
    Log.warning = warning;
})(Log = exports.Log || (exports.Log = {}));
//# sourceMappingURL=logger.js.map