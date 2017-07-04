import { Application, AppProvider } from './app';
import { KeyValuePair } from './misc';
import * as yargs from 'yargs';
/**
 * Argv interface
 */
export interface Argv extends yargs.Argv {
}
/**
 * CommandHandler interface
 */
export interface CommandHandler {
    (argv: Argv): Promise<void>;
}
/**
 * CommandOptions interface
 */
export interface CommandOptions {
    command: string;
    desc: string;
    params: KeyValuePair<yargs.Options>;
    handler: CommandHandler;
}
/**
 * Console namespace
 */
export declare namespace Console {
    /**
     * Add command
     * @param  {CommandOptions} options
     * @return {void}
     */
    function command(options: CommandOptions): void;
    /**
     * Configure command line interface
     * @param  {Application} app
     * @return {void}
     */
    function configure(app: Application): void;
    /**
     * Execute command base from parsed arguments
     * @return {void}
     */
    function execute(): void;
}
/**
 * Start CLI and you can only execute it once
 * @param  {Application} app
 * @param  {AppProvider[]} providers
 * @return {void}
 */
export declare function startConsole(app: Application, providers: AppProvider[]): Promise<void>;
