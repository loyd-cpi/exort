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
const morgan = require("morgan");
const misc_1 = require("./misc");
/**
 * Provide logger
 */
function provideLogger() {
    return (app) => __awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
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
//# sourceMappingURL=logger.js.map