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
