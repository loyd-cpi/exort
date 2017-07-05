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
     */
    function addCommand(options: CommandOptions): void;
    /**
     * Execute command base from parsed arguments
     */
    function execute(args: string[]): void;
}
/**
 * Start CLI and you can only execute it once
 */
export declare function startConsole(app: Application, providers: AppProvider[]): Promise<void>;
