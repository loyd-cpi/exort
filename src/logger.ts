import { checkAppConfig, BaseApplication } from './app';
import * as express from 'express';
import * as morgan from 'morgan';
import { _ } from './misc';

/**
 * Install logger middleware
 * @param  {T} app
 * @return {void}
 */
export function installLogger<T extends BaseApplication>(app: T): void {
  checkAppConfig(app);

  let format = 'short';
  let options: any = {};

  let logConf = app.locals.config.get('logger');
  if (logConf) {

    if (logConf.includeAssets === false) {

      let prefixes: string[] = [];
      for (let conf of app.locals.config.get('assets')) {
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
}
