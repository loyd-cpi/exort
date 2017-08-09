import { Application, AppProvider } from './app';
/**
 * Provide logger
 */
export declare function provideLogger(): AppProvider;
/**
 * Log namespace
 */
export declare namespace Log {
    /**
     * Log type enum
     */
    enum Type {
        DEBUG = "debug",
        ERROR = "error",
        INFO = "info",
        WARN = "warn",
    }
    /**
     * error console log
     */
    function error(app: Application, message: string): void;
    /**
     * debug console log
     */
    function debug(app: Application, message: string): void;
    /**
     * info console log
     */
    function info(app: Application, message: string): void;
    /**
     * warning console log
     */
    function warning(app: Application, message: string): void;
}
