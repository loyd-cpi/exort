import { Application, AppBootstrap } from '../core/app';
import { CommandOptions } from './command';
import { KeyValuePair } from '../core/misc';
/**
 * Abstract ConsoleBootstrap class
 */
export declare abstract class ConsoleBootstrap extends AppBootstrap {
}
/**
 * ConsoleApplication interface
 */
export interface ConsoleApplication extends Application {
}
/**
 * Console namespace
 */
export declare namespace Console {
    /**
     * Add command
     */
    function addCommand(app: Application, options: CommandOptions): void;
    /**
     * Execute command base from parsed arguments
     */
    function execute(args: string[], context?: KeyValuePair): void;
}
/**
 * Start CLI and you can only execute it once
 */
export declare function startConsole(app: Application): Promise<ConsoleApplication>;
