import { Config, checkAppConfig } from './boot';
import * as favicon from 'serve-favicon';
import * as express from 'express';
import * as pathlib from 'path';
import { _ } from './misc';

/**
 * Install assets
 * @param  {T} app
 * @param  {string} rootDir
 * @return {void}
 */
export function installAssets<T extends express.Server>(app: T, rootDir: string): void {
  checkAppConfig(app);

  let config: Config = app.locals.config;
  let assetsConf = config.get('assets');
  if (!assetsConf) return;

  rootDir = _.trimEnd(rootDir, '/');
  assetsConf.paths.forEach((conf: any) => {

    if (!conf || !conf.prefix || !conf.path) {
      throw new Error('Each item in assets.paths config requires prefix and path');
    }

    conf.prefix = `/${_.trim(conf.prefix, '/')}`;
    if (!pathlib.isAbsolute(conf.path)) {
      conf.path = `${rootDir}${conf.path}`;
    }

    app.use(conf.prefix, express.static(conf.path, conf.options || {}));
  });
}

/**
 * Install app favicon
 * @param  {T} app
 * @param  {string} faviconPath
 * @return {void}
 */
export function installFavicon<T extends express.Server>(app: T, faviconPath: string): void {
  checkAppConfig(app);
  app.use(favicon(faviconPath, app.locals.config.get('assets.favicon')));
}
