"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("../core/app");
const logger_1 = require("../core/logger");
const yargs = require("yargs");
/**
 * Abstract ConsoleBootstrap class
 */
class ConsoleBootstrap extends app_1.AppBootstrap {
}
exports.ConsoleBootstrap = ConsoleBootstrap;
/**
 * Console namespace
 */
var Console;
(function (Console) {
    /**
     * Add command
     */
    function addCommand(app, options) {
        yargs.command(options.command, options.desc || '', options.params, (argv) => {
            options.handler(argv)
                .then(result => {
                let settings = argv.commandSettings || {};
                if (result !== false && !settings.preventExit) {
                    process.exit(0);
                }
            })
                .catch(err => {
                logger_1.Log.error(app, `\n\n${err}`);
                process.exit(1);
            });
        });
    }
    Console.addCommand = addCommand;
    /**
     * Execute command base from parsed arguments
     */
    function execute(args, context = {}) {
        yargs.parse(args, context);
    }
    Console.execute = execute;
})(Console = exports.Console || (exports.Console = {}));
/**
 * Start CLI and you can only execute it once
 */
function startConsole(app) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        yield app_1.boot(app);
        yargs.help('help');
        Console.execute(process.argv.slice(2));
        return app;
    });
}
exports.startConsole = startConsole;
//# sourceMappingURL=app.js.map