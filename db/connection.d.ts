import { AppProvider } from '../core/app';
import { KeyValuePair } from '../core/misc';
/**
 * Provide sql and nosql connection
 */
export declare function provideConnection(modelsDir?: string): AppProvider;
/**
 * Provide sql and nosql connection
 */
export declare function provideConnection(modelsDir?: KeyValuePair<string | string[]>): AppProvider;
