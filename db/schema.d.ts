import { AppProvider, Application } from '../core/app';
/**
 * Sync schema of the connection
 */
export declare function synchronize(app: Application, connectionName?: string): Promise<void>;
/**
 * Run migration files
 */
export declare function migrate(app: Application, connectionName?: string): Promise<void>;
/**
 * Revert last migration
 */
export declare function undoLastMigration(app: Application, connectionName?: string): Promise<void>;
/**
 * Generate migration file content
 */
export declare function generateMigrationContent(name: string, timestamp: number, upSqls: string[], downSqls: string[]): string;
/**
 * Generate migration files base from changes made in models
 */
export declare function generateMigrationFiles(app: Application, className?: string, connectionName?: string): Promise<void>;
/**
 * Provide schema commands
 */
export declare function provideSchemaCommands(databaseSourceDir?: string, databaseDistDir?: string): AppProvider;
