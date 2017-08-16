import { checkAppConfig, Application, AppProvider } from '../core/app';
import * as favicon from 'serve-favicon';
import * as express from 'express';
import { _ } from '../core/misc';
import * as pathlib from 'path';

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
        conf.path = `${app.rootDir}/${conf.path}`;
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

    if (!pathlib.isAbsolute(faviconPath)) {
      faviconPath = pathlib.join(app.rootDir, faviconPath);
    }

    app.use(favicon(faviconPath, app.config.get('assets.favicon')));
  };
}
