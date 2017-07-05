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
const nunjucks = require("nunjucks");
const pathlib = require("path");
const fs = require("fs");
/**
 * TemplateLoader class
 */
class TemplateLoader extends nunjucks.Loader {
    /**
     * TemplateLoader constructor
     * @param {string} private searchPath
     */
    constructor(viewDir) {
        super();
        this.viewDir = viewDir;
        /**
         * property to your loader and it will be used asynchronously
         * @type {boolean}
         */
        this.async = true;
    }
    /**
     * Load the template
     * @param {string} name
     * @param {Function} callback
     */
    getSource(name, callback) {
        let fullPath = pathlib.join(this.viewDir, `${name}.html`);
        fs.readFile(fullPath, 'utf-8', (err, data) => {
            if (err) {
                return callback(err);
            }
            return callback(null, {
                src: data,
                path: fullPath,
                noCache: false
            });
        });
    }
}
exports.TemplateLoader = TemplateLoader;
/**
 * Set express application view engine
 * @param  {string} viewsDir
 * @return {AppProvider}
 */
function provideViewEngine(viewsDir) {
    return (app) => __awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        let env = new nunjucks.Environment(new TemplateLoader(viewsDir), app.config.get('view'));
        app.set('views', viewsDir);
        app.engine('html', (filePath, options, callback) => {
            let viewPathObj = pathlib.parse(filePath);
            let viewFilePath = pathlib.join(viewPathObj.dir.replace(viewsDir, ''), viewPathObj.name);
            env.render(viewFilePath, options, (err, res) => {
                if (err)
                    return callback(err);
                callback(null, res);
            });
        });
        app.set('view engine', 'html');
    });
}
exports.provideViewEngine = provideViewEngine;
//# sourceMappingURL=view.js.map