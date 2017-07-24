import { Context } from './service';
import * as express from 'express';
import { Store } from './misc';
/**
 * Application interface
 */
export interface Application extends express.Server {
    /**
     * Config instance
     */
    readonly config: Config;
    /**
     * Application directory which contains models and services directory
     */
    readonly dir: string;
    /**
     * Root or the current working directory
     */
    readonly rootDir: string;
    /**
     * Boot directory ex. http folder or console folder
     */
    readonly bootDir: string;
    /**
     * Single instance of context.
     * Don't use this to create service instance per request
     */
    readonly context: Context;
}
/**
 * Config class
 */
export declare class Config extends Store {
    /**
     * Load configuration files
     */
    static load(files: string[]): Config;
}
/**
 * Initialize application instance and configure
 */
export declare function createApplication(bootDir: string, configFile?: string): Application;
/**
 * Initialize application instance and configure
 */
export declare function createApplication(bootDir: string, configFiles?: string[]): Application;
/**
 * Set config object of application
 */
export declare function configure(app: Application, files: string[]): void;
/**
 * Check if application has config object
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
 */
export declare function executeProviders(app: Application, providers: AppProvider[]): Promise<void>;
