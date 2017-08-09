import { checkAppConfig, Application, AppProvider } from './app';
import * as express from 'express';
import * as morgan from 'morgan';
import { _ } from './misc';

/**
 * Provide logger
 */
export function provideLogger(): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    if (app.testMode) return;

    let format = 'short';
    let options: any = {};

    let logConf = app.config.get('logger');
    if (logConf) {

      if (logConf.includeAssets === false) {

        let prefixes: string[] = [];
        for (let conf of app.config.get('assets')) {
          if (conf.prefix) prefixes.push(`/${_.trim(conf.prefix, '/')}`);
        }

        if (prefixes.length) {
          options.skip = (req: express.Request, res: express.Response) => {
            for (let prefix of prefixes) {
              if (_.startsWith(req.baseUrl, prefix)) return true;
            }
            return false;
          };
        }
      }

      if (typeof logConf.format != 'undefined') {
        format = logConf.format;
      }
    }

    app.use(morgan(format, options));
  };
}

/**
 * Log namespace
 */
export namespace Log {

  /**
   * Log type enum
   */
  export enum Type {
    DEBUG = 'debug',
    ERROR = 'error',
    INFO = 'info',
    WARN = 'warn'
  }

  /**
   * write console log
   */
  function write(app: Application, message: string, type: Type): void {
    if (app.testMode) return;
    (console as any)[type](message);
  }

  /**
   * error console log
   */
  export function error(app: Application, message: string): void {
    write(app, message, Type.ERROR);
  }

  /**
   * debug console log
   */
  export function debug(app: Application, message: string): void {
    write(app, message, Type.DEBUG);
  }

  /**
   * info console log
   */
  export function info(app: Application, message: string): void {
    write(app, message, Type.INFO);
  }

  /**
   * warning console log
   */
  export function warning(app: Application, message: string): void {
    write(app, message, Type.WARN);
  }
}
