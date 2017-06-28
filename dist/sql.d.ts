import { AppProvider } from './boot';
import { KeyValuePair } from './misc';
import * as express from 'express';
/**
 * Provide sql connection
 * @param  {string | KeyValuePair<string | string[]>} modelsDir
 * @return {AppProvider<T>}
 */
export declare function provideSQLConnection<T extends express.Server>(modelsDir: string | KeyValuePair<string | string[]>): AppProvider<T>;
