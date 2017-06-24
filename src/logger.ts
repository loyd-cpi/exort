import { checkAppConfig, Config } from './config';
import * as express from 'express';
import * as morgan from 'morgan';
import { _ } from './misc';

/**
 * Install logger middleware
 * @param  {express.Application} app
 * @return {void}
 */
export function installLogger(app: express.Application): void {
  checkAppConfig(app);

  let config: Config = app.locals.config;
  let format = 'short';
  let options: any = {};

  let logConf = config.get('logger');
  if (logConf) {

    if (logConf.includeAssets === false) {

      let prefixes: string[] = [];
      for (let conf of config.get('assets')) {
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
