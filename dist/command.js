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
const sql_1 = require("./sql");
const yargs = require("yargs");
/**
 * CLI class
 */
var CLI;
(function (CLI) {
    /**
     * Flag that CLI.configure() is already called
     * @type {boolean}
     */
    let isConfigured = false;
    /**
     * Add command
     * @param  {CommandOptions} options
     * @return {void}
     */
    function command(options) {
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
    CLI.command = command;
    /**
     * Configure command line interface
     * @param  {Application} app
     * @return {void}
     */
    function configure(app) {
        if (isConfigured) {
            throw new Error('CLI.configure(app) is already called');
        }
        app_1.checkAppConfig(app);
        command({
            command: 'sync:schema',
            desc: 'Sync models and database schema',
            params: {
                'connection': {
                    required: false
                }
            },
            handler(argv) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield sql_1.syncSchema(argv.connection);
                });
            }
        });
        yargs.help('help');
        isConfigured = true;
    }
    CLI.configure = configure;
    /**
     * Execute command base from parsed arguments
     * @return {void}
     */
    function execute() {
        yargs.parse(process.argv.slice(2));
    }
    CLI.execute = execute;
})(CLI = exports.CLI || (exports.CLI = {}));
/**
 * Start CLI and you can only execute it once
 * @param  {Application} app
 * @param  {AppProvider[]} providers
 * @return {void}
 */
function startCLI(app, providers) {
    CLI.configure(app);
    CLI.execute();
}
exports.startCLI = startCLI;
//# sourceMappingURL=command.js.map