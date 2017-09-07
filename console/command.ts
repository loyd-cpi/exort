import { ConsoleApplication } from './app';
import { Context } from '../core/service';
import { Input } from '../core/store';
import * as yargs from 'yargs';

/**
 * Argv interface
 */
export interface Arguments extends yargs.Arguments {}

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
export abstract class Command {

  /**
   * Context instance
   */
  protected readonly context: Context;

  /**
   * Command constructor
   */
  constructor(protected readonly app: ConsoleApplication, protected readonly input: Input) {
    this.context = app.context;
  }

  /**
   * Finish the command and generate result
   */
  public preventExit() {
    return false;
  }

  /**
   * Abstract handle method
   */
  public abstract async handle(): Promise<boolean | void | undefined>;
}
