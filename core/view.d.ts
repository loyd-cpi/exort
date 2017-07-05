import { AppProvider } from './app';
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
 * @param  {string} viewsDir
 * @return {AppProvider}
 */
export declare function provideViewEngine(viewsDir: string): AppProvider;
