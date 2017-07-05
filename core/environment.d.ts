/**
 * Load environment file and setup namespace
 */
export declare function setupEnvironmentAndNamespace(directory: string): void;
/**
 * Get environment value
 */
export declare function env(key: string, defaultVal?: any): any;
/**
 * Get CLI argument
 */
export declare function argument(key: string, defaultVal?: any): any;
