"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
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
     */
    constructor(viewDir) {
        super();
        this.viewDir = viewDir;
        /**
         * property to your loader and it will be used asynchronously
         */
        this.async = true;
    }
    /**
     * Load the template
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
 */
function provideViewEngine(viewsDir) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        viewsDir = viewsDir || `${app.rootDir}/views`;
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