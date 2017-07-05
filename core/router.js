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
const http_1 = require("./http");
const validation_1 = require("./validation");
/**
 * Provide routes
 */
function provideRoutes(routesFile) {
    return (app) => __awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        let routes = require(routesFile);
        if (typeof routes != 'object') {
            throw new Error('Invalid routes file');
        }
        if (typeof routes.setup == 'function') {
            routes.setup(app);
        }
        app.use((err, req, res, next) => {
            let details = {
                name: err.name,
                message: err.message,
            };
            if (app.config.get('app.env') != 'production') {
                details.stack = err.stack;
            }
            if (err instanceof validation_1.FormValidationError) {
                details.fields = err.fields;
                res.status(400);
            }
            else if (err instanceof http_1.HttpError) {
                res.status(err.statusCode);
            }
            else {
                res.status(500);
            }
            if (req.accepts('json')) {
                res.json({ error: details });
            }
            else if (req.accepts('html')) {
                res.render(`errors/${res.statusCode}`, { error: details });
            }
            else {
                res.send(JSON.stringify(details));
            }
        });
    });
}
exports.provideRoutes = provideRoutes;
//# sourceMappingURL=router.js.map