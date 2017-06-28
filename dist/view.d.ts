import { BaseApplication } from './app';
import * as nunjucks from 'nunjucks';
/**
 * TemplateLoader class
 */
export declare class TemplateLoader extends nunjucks.Loader {
    private viewDir;
    /**
     * property to your loader and it will be used asynchronously
     * @type {boolean}
     */
    protected async: boolean;
    /**
     * TemplateLoader constructor
     * @param {string} private searchPath
     */
    constructor(viewDir: string);
    /**
     * Load the template
     * @param {string} name
     * @param {Function} callback
     */
    getSource(name: string, callback: Function): void;
}
/**
 * ViewConfig interface
 */
export interface ViewConfig extends nunjucks.ConfigureOptions {
}
/**
 * Set express application view engine
 * @param  {T} app
 * @param  {string} viewsDir
 * @return {void}
 */
export declare function installViewEngine<T extends BaseApplication>(app: T, viewsDir: string): void;
