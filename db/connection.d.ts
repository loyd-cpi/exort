import { Connection } from 'typeorm';
import { AppProvider, Application } from '../core/app';
/**
 * Default connection name
 */
export declare const DEFAULT_CONNECTION_NAME: string;
/**
 * Provide sql and nosql connection
 */
export declare function provideConnection(modelsDir?: string, migrationsReadDir?: string, migrationsWriteDir?: string): AppProvider;
/**
 * Compose prefixed connection name
 */
export declare function prefixConnectionName(app: Application, name?: string): string;
/**
 * Get connection from specified application instance
 */
export declare function getConnection(app: Application, name?: string): Connection;
