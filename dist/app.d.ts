import { Context } from './service';
import * as express from 'express';
import { Store } from './misc';
/**
 * Application interface
 */
export interface Application extends express.Server {
    /**
     * Config instance
     * @type {Config}
     */
    readonly config: Config;
    /**
     * Application root directory
     * @type {string}
     */
    readonly dir: string;
    /**
     * Single instance of context.
     * Don't use this to create service instance per request
     * @type {Context}
     */
    readonly context: Context;
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
 * Initialize application instance and configure
 * @param rootDir
 * @param configFiles
 */
export declare function createApplication(rootDir: string, configFiles: string[]): Application;
/**
 * Set config object of application
 * @param  {Application} app
 * @param  {string[]} files
 * @return {void}
 */
export declare function configure(app: Application, files: string[]): void;
/**
 * Check if application has config object
 * @param  {Application} app
 * @return {void}
 */
export declare function checkAppConfig(app: Application): void;
/**
 * AppProvider interface
 */
export interface AppProvider {
    (app: Application): Promise<void>;
}
/**
 * Execute providers and boot the application
 * @param  {Application} app
 * @param  {AppProvider[]} providers
 * @return {Promise<void>}
 */
export declare function executeProviders(app: Application, providers: AppProvider[]): Promise<void>;
