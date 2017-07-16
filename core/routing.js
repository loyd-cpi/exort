"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("./app");
const http_1 = require("./http");
const validation_1 = require("./validation");
const express = require("express");
/**
 * Provide routes
 */
function provideRoutes(routesFile) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                res.status(422);
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
/**
 * Router namespace
 */
var Router;
(function (Router) {
    /**
     * Create new instance of express.Router
     */
    function create(options) {
        return express.Router(options);
    }
    Router.create = create;
})(Router = exports.Router || (exports.Router = {}));
//# sourceMappingURL=routing.js.map