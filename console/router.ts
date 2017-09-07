import { CommandParams, Arguments, Command } from './command';
import { AppProvider, checkAppConfig } from '../core/app';
import { ConsoleApplication, Console } from './app';
import { Input } from '../core/store';
import { Error } from '../core/error';
import { _ } from '../core/misc';

/**
 * Router class
 */
export class Router {

  /**
   * Router constructor
   */
  constructor(private app: ConsoleApplication, private commandsDir: string) {}

  /**
   * Register command
   */
  public command(command: string, commandClassName: string, params?: CommandParams, desc?: string): void {
    const commandClass = _.requireClass(`${this.commandsDir}/${commandClassName}`);
    if (!_.classExtends(commandClass, Command)) {
      throw new Error(`${commandClassName} class must extends Command class`);
    }

    if (typeof commandClass.prototype.handle != 'function') {
      throw new Error(`${commandClassName} class must have handle method`);
    }

    const handler = (argv: Arguments) => {
      const commandInstance = Reflect.construct(commandClass, [this.app, new Input(argv)]) as Command;
      return commandInstance.handle();
    };

    Console.addCommand(this.app, { command, desc, params: params || {}, handler });
  }
}

/**
 * Provide routes
 */
export function provideRoutes(routesModule?: string, commandsDir?: string): AppProvider {
  return async (app: ConsoleApplication): Promise<void> => {
    checkAppConfig(app);

    if (commandsDir) {
      commandsDir = _.trimEnd(commandsDir, '/');
    } else {
      commandsDir = `${app.bootDir}/commands`;
    }

    let routes = require(routesModule || `${app.bootDir}/routes`);
    if (typeof routes != 'object') {
      throw new Error('Invalid routes file');
    }

    if (typeof routes.setup == 'function') {
      let router = new Router(app, commandsDir);
      routes.setup(router, app);
    }
  };
}
