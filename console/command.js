"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("../core/app");
const yargs = require("yargs");
/**
 * Console namespace
 */
var Console;
(function (Console) {
    /**
     * Add command
     */
    function addCommand(options) {
        yargs.command(options.command, options.desc, options.params, (argv) => {
            options.handler(argv)
                .then(() => {
                console.log(`\n\n${options.command} done`);
                process.exit(0);
            })
                .catch(err => {
                console.error(`\n\n${err}`);
                process.exit(1);
            });
        });
    }
    Console.addCommand = addCommand;
    /**
     * Execute command base from parsed arguments
     */
    function execute(args) {
        yargs.parse(args);
    }
    Console.execute = execute;
})(Console = exports.Console || (exports.Console = {}));
/**
 * Start CLI and you can only execute it once
 */
function startConsole(app, providers) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        yield app_1.executeProviders(app, providers);
        yargs.help('help');
        Console.execute(process.argv.slice(2));
    });
}
exports.startConsole = startConsole;
//# sourceMappingURL=command.js.map