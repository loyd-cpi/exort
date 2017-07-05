import { checkAppConfig, Application, AppProvider } from './app';
import { KeyValuePair } from './misc';
import * as nunjucks from 'nunjucks';
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
 * @param  {string} viewsDir
 * @return {AppProvider}
 */
export function provideViewEngine(viewsDir: string): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    let env = new nunjucks.Environment(new TemplateLoader(viewsDir) as any, app.config.get('view'));
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
  };
}
