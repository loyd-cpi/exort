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
/**
 * Provide routes
 * @param  {string} routesFile
 * @return {AppProvider}
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
    });
}
exports.provideRoutes = provideRoutes;
//# sourceMappingURL=router.js.map