/**
 * Load environment file
 * @param {string} envFile
 */
export declare function loadEnvironmentFromDir(directory: string): void;
/**
 * Get environment value
 * @param  {string} key
 * @param  {any} defaultVal
 * @return {any}
 */
export declare function env(key: string, defaultVal?: any): any;
/**
 * Get CLI argument
 * @param  {string} key
 * @param  {any} defaultVal
 * @return {any}
 */
export declare function argument(key: string, defaultVal?: any): any;
