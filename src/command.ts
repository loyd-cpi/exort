import { checkAppConfig, BaseApplication } from './app';
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
 * CLI class
 */
export abstract class CLI {

  /**
   * Flag if CLI.configure() is already called
   * @type {boolean}
   */
  private static isConfigured: boolean = false;

  /**
   * Add command
   * @param  {CommandOptions} options
   * @return {void}
   */
  public static command(options: CommandOptions): void {
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
   * @param  {T} app
   * @return {void}
   */
  public static configure<T extends BaseApplication>(app: T): void {
    if (this.isConfigured) {
      throw new Error('CLI.configure(app) is already called');
    }

    checkAppConfig(app);

    this.command({
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
    this.isConfigured = true;
  }

  /**
   * Execute command base from parsed arguments
   * @return {void}
   */
  public static execute(): void {
    yargs.parse(process.argv.slice(2));
  }
}
