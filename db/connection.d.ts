import { AppProvider } from '../core/app';
import { KeyValuePair } from '../core/misc';
/**
 * Provide sql connection
 */
export declare function provideSqlConnection(modelsDir: string | KeyValuePair<string | string[]>): AppProvider;
