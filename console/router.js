"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("./command");
const app_1 = require("../core/app");
const app_2 = require("./app");
const store_1 = require("../core/store");
const error_1 = require("../core/error");
const misc_1 = require("../core/misc");
/**
 * Router class
 */
class Router {
    /**
     * Router constructor
     */
    constructor(app, commandsDir) {
        this.app = app;
        this.commandsDir = commandsDir;
    }
    /**
     * Register command
     */
    command(command, commandClassName, params, desc) {
        const commandClass = misc_1._.requireClass(`${this.commandsDir}/${commandClassName}`);
        if (!misc_1._.classExtends(commandClass, command_1.Command)) {
            throw new error_1.Error(`${commandClassName} class must extends Command class`);
        }
        if (typeof commandClass.prototype.handle != 'function') {
            throw new error_1.Error(`${commandClassName} class must have handle method`);
        }
        const handler = (argv) => {
            const commandInstance = Reflect.construct(commandClass, [this.app, new store_1.Input(argv)]);
            return commandInstance.handle();
        };
        app_2.Console.addCommand(this.app, { command, desc, params: params || {}, handler });
    }
}
exports.Router = Router;
/**
 * Provide routes
 */
function provideRoutes(routesModule, commandsDir) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        if (commandsDir) {
            commandsDir = misc_1._.trimEnd(commandsDir, '/');
        }
        else {
            commandsDir = `${app.bootDir}/commands`;
        }
        let routes = require(routesModule || `${app.bootDir}/routes`);
        if (typeof routes != 'object') {
            throw new error_1.Error('Invalid routes file');
        }
        if (typeof routes.setup == 'function') {
            let router = new Router(app, commandsDir);
            routes.setup(router, app);
        }
    });
}
exports.provideRoutes = provideRoutes;
//# sourceMappingURL=router.js.map