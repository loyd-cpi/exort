"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boot_1 = require("./boot");
/**
 * Setup routes
 * @param  {express.Server} app
 * @param  {string} routesFile
 * @return {void}
 */
function installRoutes(app, routesFile) {
    boot_1.checkAppConfig(app);
    let routes = require(routesFile);
    if (typeof routes != 'object') {
        throw new Error('Invalid routes file');
    }
    if (typeof routes.setup == 'function') {
        routes.setup(app);
    }
}
exports.installRoutes = installRoutes;
//# sourceMappingURL=router.js.map