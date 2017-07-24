import { AppProvider } from './app';
import * as nunjucks from 'nunjucks';
/**
 * TemplateLoader class
 */
export declare class TemplateLoader extends nunjucks.Loader {
    private viewDir;
    /**
     * property to your loader and it will be used asynchronously
     */
    protected async: boolean;
    /**
     * TemplateLoader constructor
     */
    constructor(viewDir: string);
    /**
     * Load the template
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
 */
export declare function provideViewEngine(viewsDir?: string): AppProvider;
