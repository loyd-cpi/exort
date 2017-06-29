import { BaseApplication } from './app';
import * as nunjucks from 'nunjucks';
import * as express from 'express';
import { Store } from './misc';
/**
 * ApplicationProps interface
 */
export interface ApplicationProps {
    config: Config;
    view: nunjucks.Environment;
}
/**
 * BaseApplication interface
 */
export interface BaseApplication extends express.Server {
    locals: ApplicationProps;
}
/**
 * Config class
 */
export declare class Config extends Store {
    /**
     * Load configuration files
     * @param  {string[]} files
     * @return {Config}
     */
    static load(files: string[]): Config;
}
/**
 * Set config object of application
 * @param  {T} app
 * @param  {string} rootDir
 * @param  {string[]} files
 * @return {void}
 */
export declare function configure<T extends BaseApplication>(app: T, rootDir: string, files: string[]): void;
/**
 * Check if application has config object
 * @param  {T} app
 * @return {void}
 */
export declare function checkAppConfig<T extends BaseApplication>(app: T): void;
/**
 * AppProvider interface
 */
export interface AppProvider<T extends BaseApplication> {
    (app: T): Promise<void>;
}
/**
 * Execute providers and boot the application
 * @param  {U} app
 * @param  {AppProvider<U>} providers
 * @return {Promise<void>}
 */
export declare function boot<U extends BaseApplication>(app: U, providers: AppProvider<U>[]): Promise<void>;
