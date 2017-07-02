import { AppProvider } from './app';
import { KeyValuePair } from './misc';
/**
 * Provide sql connection
 * @param  {string | KeyValuePair<string | string[]>} modelsDir
 * @return {AppProvider<T>}
 */
export declare function provideSQLConnection(modelsDir: string | KeyValuePair<string | string[]>): AppProvider;
/**
 * Sync schema of the connection
 * @param  {string} connectionName
 * @return {Promise<void>}
 */
export declare function syncSchema(connectionName?: string): Promise<void>;
