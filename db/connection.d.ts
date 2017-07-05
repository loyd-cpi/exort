import { AppProvider } from '../core/app';
import { KeyValuePair } from '../core/misc';
/**
 * Provide sql and nosql connection
 */
export declare function provideConnection(modelsDir: string | KeyValuePair<string | string[]>): AppProvider;
