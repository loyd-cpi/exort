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
class CLI {
    /**
     * Add command
     * @param  {CommandOptions} options
     * @return {void}
     */
    static command(options) {
        yargs.command(options.command, options.desc, options.params, (argv) => {
            options.handler(argv)
                .then(() => {
                console.log(`\n\n${options.command} done`);
                process.exit(0);
            })
                .catch(err => {
                throw err;
            });
        });
    }
    /**
     * Configure command line interface
     * @param  {T} app
     * @return {void}
     */
    static configure(app) {
        if (this.isConfigured) {
            throw new Error('CLI.configure(app) is already called');
        }
        app_1.checkAppConfig(app);
        this.command({
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
        this.isConfigured = true;
    }
    /**
     * Execute command base from parsed arguments
     * @return {void}
     */
    static execute() {
        yargs.parse(process.argv.slice(2));
    }
}
/**
 * Flag if CLI.configure() is already called
 * @type {boolean}
 */
CLI.isConfigured = false;
exports.CLI = CLI;
//# sourceMappingURL=command.js.map