import { AppProvider } from '../core/app';
/**
 * Sync schema of the connection
 */
export declare function syncSchema(connectionName?: string): Promise<void>;
/**
 * Provide schema commands
 */
export declare function provideSchemaCommands(databaseSourceDir: string, databaseDistDir: string): AppProvider;
