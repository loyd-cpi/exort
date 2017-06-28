import { Config, checkAppConfig } from './boot';
import { KeyValuePair } from './misc';
import * as nunjucks from 'nunjucks';
import * as express from 'express';
import * as pathlib from 'path';
import * as fs from 'fs';

/**
 * TemplateLoader class
 */
export class TemplateLoader extends nunjucks.Loader {

  /**
   * property to your loader and it will be used asynchronously
   * @type {boolean}
   */
  protected async: boolean = true;

  /**
   * TemplateLoader constructor
   * @param {string} private searchPath
   */
  constructor(private viewDir: string) {
    super();
  }

  /**
   * Load the template
   * @param {string} name
   * @param {Function} callback
   */
  public getSource(name: string, callback: Function) {
    let fullPath = pathlib.join(this.viewDir, `${name}.html`);
    fs.readFile(fullPath, 'utf-8', (err, data) => {

      if (err) {
        return callback(err);
      }

      return callback(null, {
        src: data,
        path: fullPath,
        noCache: false
      });
    });
  }
}

/**
 * ViewConfig interface
 */
export interface ViewConfig extends nunjucks.ConfigureOptions {}

/**
 * Set express application view engine
 * @param  {express.Server} app
 * @param  {ViewConfig} config
 * @return {void}
 */
export function installViewEngine<T extends express.Server>(app: T, viewsDir: string): void {
  checkAppConfig(app);

  let config: Config = app.locals.config;
  let env = new nunjucks.Environment(new TemplateLoader(viewsDir) as any, config.get('view'));

  app.locals.view = env;
  app.set('views', viewsDir);
  app.engine('html', (filePath: string, options: KeyValuePair<string>, callback: Function) => {

    let viewPathObj = pathlib.parse(filePath);
    let viewFilePath = pathlib.join(viewPathObj.dir.replace(viewsDir, ''), viewPathObj.name);
    env.render(viewFilePath, options, (err, res: string) => {

      if (err) return callback(err);
      callback(null, res);
    });
  });

  app.set('view engine', 'html');
}
