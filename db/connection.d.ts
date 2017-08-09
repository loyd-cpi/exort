import { Connection } from 'typeorm';
import { AppProvider, Application } from '../core/app';
/**
 * Provide sql and nosql connection
 */
export declare function provideConnection(modelsDir?: string): AppProvider;
/**
 * Get connection from specified application instance
 */
export declare function getConnection(app: Application, name?: string): Connection;
