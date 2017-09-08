import { Application, checkAppConfig, AppBootstrap, boot } from '../core/app';
import { CommandOptions, Arguments } from './command';
import { KeyValuePair } from '../core/misc';
import { Log } from '../core/logger';
import * as yargs from 'yargs';

/**
 * Abstract ConsoleBootstrap class
 */
export abstract class ConsoleBootstrap extends AppBootstrap {}

/**
 * ConsoleApplication interface
 */
export interface ConsoleApplication extends Application {}

/**
 * Console namespace
 */
export namespace Console {

  /**
   * Add command
   */
  export function addCommand(app: Application, options: CommandOptions): void {
    yargs.command(options.command, options.desc || '', options.params, (argv: Arguments) => {
      options.handler(argv)
        .then(result => {

          let settings = argv.commandSettings || {};
          if (result !== false && !settings.preventExit) {
            process.exit(0);
          }

        })
        .catch(err => {
          Log.error(app, `\n\n${err}`);
          process.exit(1);
        });
    });
  }

  /**
   * Execute command base from parsed arguments
   */
  export function execute(args: string[], context: KeyValuePair = {}) {
    yargs.parse(args, context);
  }
}

/**
 * Start CLI and you can only execute it once
 */
export async function startConsole(app: Application): Promise<ConsoleApplication> {
  checkAppConfig(app);
  await boot(app);
  yargs.help('help');
  Console.execute(process.argv.slice(2));
  return app as ConsoleApplication;
}
