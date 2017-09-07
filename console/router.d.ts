import { CommandParams } from './command';
import { AppProvider } from '../core/app';
import { ConsoleApplication } from './app';
/**
 * Router class
 */
export declare class Router {
    private app;
    private commandsDir;
    /**
     * Router constructor
     */
    constructor(app: ConsoleApplication, commandsDir: string);
    /**
     * Register command
     */
    command(command: string, commandClassName: string, params?: CommandParams, desc?: string): void;
}
/**
 * Provide routes
 */
export declare function provideRoutes(routesModule?: string, commandsDir?: string): AppProvider;
