import { checkAppConfig, boot, Application } from '../core/app';
import * as yargs from 'yargs';

/**
 * Argv interface
 */
export interface Arguments extends yargs.Arguments {}

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
export namespace Console {

  /**
   * Add command
   */
  export function addCommand(options: CommandOptions): void {
    yargs.command(options.command, options.desc, options.params, (argv: Arguments) => {
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

  /**
   * Execute command base from parsed arguments
   */
  export function execute(args: string[]) {
    yargs.parse(args);
  }
}

/**
 * Start CLI and you can only execute it once
 */
export async function startConsole(app: Application): Promise<void> {
  checkAppConfig(app);
  await boot(app);
  yargs.help('help');
  Console.execute(process.argv.slice(2));
}
