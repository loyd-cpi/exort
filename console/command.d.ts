/// <reference types="yargs" />
import { Application } from '../core/app';
import * as yargs from 'yargs';
/**
 * Argv interface
 */
export interface Arguments extends yargs.Arguments {
}
/**
 * CommandHandler interface
 */
export interface CommandHandler {
    (argv: Arguments): Promise<void>;
}
/**
 * CommandParams interface
 */
export interface CommandParams {
    [optionName: string]: yargs.Options;
}
/**
 * CommandOptions interface
 */
export interface CommandOptions {
    command: string;
    desc: string;
    params: CommandParams;
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
export declare function startConsole(app: Application): Promise<void>;
