/// <reference types="yargs" />
import { ConsoleApplication } from './app';
import { Context } from '../core/service';
import { Input } from '../core/store';
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
    (argv: Arguments): Promise<boolean | void | undefined>;
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
    desc?: string;
    params: CommandParams;
    handler: CommandHandler;
}
/**
 * Abstract Command class
 */
export declare abstract class Command {
    protected readonly app: ConsoleApplication;
    protected readonly input: Input;
    /**
     * Context instance
     */
    protected readonly context: Context;
    /**
     * Command constructor
     */
    constructor(app: ConsoleApplication, input: Input);
    /**
     * Finish the command and generate result
     */
    preventExit(): boolean;
    /**
     * Abstract handle method
     */
    abstract handle(): Promise<boolean | void | undefined>;
}
