import { checkAppConfig, executeProviders, Application, AppProvider } from '../core/app';
import { KeyValuePair } from '../core/misc';
import * as yargs from 'yargs';

/**
 * Argv interface
 */
export interface Argv extends yargs.Argv {}

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
export namespace Console {

  /**
   * Add command
   */
  export function addCommand(options: CommandOptions): void {
    yargs.command(options.command, options.desc, options.params, (argv: yargs.Argv) => {
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
export async function startConsole(app: Application, providers: AppProvider[]): Promise<void> {
  checkAppConfig(app);
  await executeProviders(app, providers);
  yargs.help('help');
  Console.execute(process.argv.slice(2));
}
