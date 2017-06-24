import { checkAppConfig } from './config';
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
 * @param  {express.Application} app
 * @param  {ViewConfig} config
 * @return {void}
 */
export function installViewEngine(app: express.Application, viewsDir: string): void {
  checkAppConfig(app);
  app.set('view', viewsDir);
  app.set('view engine', 'html');
  let env = new nunjucks.Environment(new TemplateLoader(viewsDir) as any, app.locals.config);
  env.express(app);
  app.locals.view = env;
}
