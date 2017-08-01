/// <reference types="mocha" />
import { Application, AppProvider } from '../core/app';
import { WebApplication } from '../web/app';
import * as Mocha from 'mocha';
/**
 * TestRunner class
 */
export declare class TestRunner extends Mocha {
    /**
     * WebApplication instance to test
     */
    static readonly app: WebApplication;
}
/**
 * Create testable application instance
 */
export declare function createTestApplication(bootDir: string, configFiles?: string | string[]): Application;
/**
 * Start running tests
 */
export declare function startTesting(app: Application, testCasesDir?: string): void;
/**
 * Provide test commands
 */
export declare function provideTestCommands(runnerFile?: string): AppProvider;
