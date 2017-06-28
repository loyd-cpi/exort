import * as express from 'express';
import { Store } from './misc';
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
 * @param  {string[]} files
 * @return {void}
 */
export declare function configure<T extends express.Server>(app: T, files: string[]): void;
/**
 * Check if application has config object
 * @param  {T} app
 * @return {void}
 */
export declare function checkAppConfig<T extends express.Server>(app: T): void;
/**
 * AppProvider interface
 */
export interface AppProvider<T extends express.Server> {
    (app: T): Promise<void>;
}
/**
 * Execute providers and boot the application
 * @param  {U} app
 * @param  {AppProvider<U>} providers
 * @return {Promise<void>}
 */
export declare function boot<U extends express.Server>(app: U, providers: AppProvider<U>[]): Promise<void>;
