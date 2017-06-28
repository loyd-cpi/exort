import { BaseApplication } from './app';
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
 * CLI class
 */
export declare abstract class CLI {
    /**
     * Flag if CLI.configure() is already called
     * @type {boolean}
     */
    private static isConfigured;
    /**
     * Add command
     * @param  {CommandOptions} options
     * @return {void}
     */
    static command(options: CommandOptions): void;
    /**
     * Configure command line interface
     * @param  {T} app
     * @return {void}
     */
    static configure<T extends BaseApplication>(app: T): void;
    /**
     * Execute command base from parsed arguments
     * @return {void}
     */
    static execute(): void;
}
