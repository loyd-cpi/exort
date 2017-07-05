import { checkAppConfig, Application, AppProvider } from './app';
import * as favicon from 'serve-favicon';
import * as express from 'express';
import * as pathlib from 'path';
import { _ } from './misc';

/**
 * Install assets
 */
export function provideAssets(): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    let assetsConf = app.config.get('assets');
    if (!assetsConf) return;

    assetsConf.paths.forEach((conf: any) => {

      if (!conf || !conf.prefix || !conf.path) {
        throw new Error('Each item in assets.paths config requires prefix and path');
      }

      conf.prefix = `/${_.trim(conf.prefix, '/')}`;
      if (!pathlib.isAbsolute(conf.path)) {
        conf.path = `${app.dir}${conf.path}`;
      }

      app.use(conf.prefix, express.static(conf.path, conf.options || {}));
    });
  };
}

/**
 * Provide favicon
 */
export function provideFavicon(faviconPath: string): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);
    app.use(favicon(faviconPath, app.config.get('assets.favicon')));
  };
}
