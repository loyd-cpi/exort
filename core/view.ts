import { checkAppConfig, Application, AppProvider } from './app';
import { KeyValuePair } from './misc';
import * as nunjucks from 'nunjucks';
import { Error } from './error';
import * as pathlib from 'path';
import * as fs from 'fs';

/**
 * TemplateLoader class
 */
export class TemplateLoader extends nunjucks.Loader {

  /**
   * property to your loader and it will be used asynchronously
   */
  protected async: boolean = true;

  /**
   * TemplateLoader constructor
   */
  constructor(private viewDir: string) {
    super();
  }

  /**
   * Load the template
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
 */
export function provideViewEngine(viewsDir?: string): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    viewsDir = viewsDir || `${app.rootDir}/views`;

    let env = new nunjucks.Environment(new TemplateLoader(viewsDir) as any, app.config.get('view'));
    app.set('views', viewsDir);
    app.engine('html', (filePath: string, options: KeyValuePair<string>, callback: Function) => {

      let viewPathObj = pathlib.parse(filePath);
      let viewFilePath = pathlib.join(viewPathObj.dir.replace(viewsDir as string, ''), viewPathObj.name);
      env.render(viewFilePath, options, (err, res: string) => {

        if (err) return callback(err);
        callback(null, res);
      });
    });

    app.set('view engine', 'html');

    (app as any)._render = app.render;
    (app as any).render = function (name: string, options?: Object, callback?: (err: Error, html: string) => void): Promise<string> | void {

      if (typeof options != 'function' && typeof callback != 'function') {
        return new Promise<string>((resolve, reject) => {

          (app as any)._render(name, options, (err: Error, html: string) => {
            if (err) return reject(err);
            resolve(html);
          });
        });
      }

      (app as any)._render(name, options, callback);
    };
  };
}
