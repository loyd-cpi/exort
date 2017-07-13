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
    return __awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        yield app_1.executeProviders(app, providers);
        yargs.help('help');
        Console.execute(process.argv.slice(2));
    });
}
exports.startConsole = startConsole;
//# sourceMappingURL=command.js.map