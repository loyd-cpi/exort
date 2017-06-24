import { Config, checkAppConfig } from './config';
import * as favicon from 'serve-favicon';
import * as express from 'express';
import * as pathlib from 'path';
import { _ } from './misc';

/**
 * Install assets
 * @param  {express.Application} app
 * @param  {string} rootDir
 * @return {void}
 */
export function installAssets(app: express.Application, rootDir: string): void {
  checkAppConfig(app);

  let config: Config = app.locals.config;
  let assetsConf = config.get('assets');
  if (!assetsConf) return;

  rootDir = _.trimEnd(rootDir, '/');
  assetsConf.paths.forEach((conf: any) => {

    if (!conf || !conf.prefix || !conf.path) return;

    conf.prefix = `/${_.trim(conf.prefix, '/')}`;
    if (!pathlib.isAbsolute(conf.path)) {
      conf.path = `${rootDir}${conf.path}`;
    }

    app.use(express.static(conf.path), conf.prefix);
  });
}

/**
 * Install app favicon
 * @param  {express.Application} app
 * @param  {string} faviconPath
 * @return {void}
 */
export function installFavicon(app: express.Application, faviconPath: string): void {
  checkAppConfig(app);
  app.use(favicon(faviconPath, app.locals.config.get('assets.favicon')));
}
