import { checkAppConfig, executeProviders, Application, AppProvider } from './app';
import { KeyValuePair } from './misc';
import { syncSchema } from './sql';
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
   * Flag that CLI.configure() is already called
   * @type {boolean}
   */
  let isConfigured: boolean = false;

  /**
   * Add command
   * @param  {CommandOptions} options
   * @return {void}
   */
  export function command(options: CommandOptions): void {
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
   * Configure command line interface
   * @param  {Application} app
   * @return {void}
   */
  export function configure(app: Application): void {
    if (isConfigured) {
      throw new Error('CLI.configure(app) is already called');
    }

    checkAppConfig(app);

    command({
      command: 'sync:schema',
      desc: 'Sync models and database schema',
      params: {
        'connection': {
          required: false
        }
      },
      async handler(argv: Argv) {
        await syncSchema(argv.connection);
      }
    });

    yargs.help('help');
    isConfigured = true;
  }

  /**
   * Execute command base from parsed arguments
   * @return {void}
   */
  export function execute() {
    yargs.parse(process.argv.slice(2));
  }
}

/**
 * Start CLI and you can only execute it once
 * @param  {Application} app
 * @param  {AppProvider[]} providers
 * @return {void}
 */
export async function startConsole(app: Application, providers: AppProvider[]): Promise<void> {
  await executeProviders(app, providers);
  Console.configure(app);
  Console.execute();
}
