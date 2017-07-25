import { KeyValuePair } from './misc';
import { Application } from './app';
import { Context } from './service';
/**
 * Base ErrorHandler class
 */
export declare abstract class ErrorHandler {
    protected readonly app: Application;
    protected readonly context: Context;
    /**
     * ErrorHandler constructor
     */
    constructor(app: Application, context: Context);
    /**
     * Abstract report method
     */
    abstract report(error: Error): Promise<void>;
}
/**
 * Error class
 */
export declare class Error extends global.Error {
    /**
     * Error constructor
     */
    constructor(message?: string);
    /**
     * toJSON method
     */
    toJSON(): KeyValuePair;
}
