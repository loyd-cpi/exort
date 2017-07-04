import { Connection, Repository } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { AppProvider } from './app';
import { Model, Service } from './service';
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
/**
 * Abstract SqlService class
 */
export declare abstract class SqlService<T extends Model> extends Service {
    /**
     * Model class
     * @type {(new() => T)}
     */
    protected modelClass: new () => T;
    /**
     * Gets registered connection with the given name.
     * If connection name is not given then it will get a default connection.
     * Throws exception if connection with the given name was not found.
     * @param  {string} name
     * @return {Connection}
     */
    protected getConnection(name?: string): Connection;
    /**
     * Gets repository for the service entity
     * @param  {string} connection
     * @return {Repository<T>}
     */
    protected getRepository(connection?: string): Repository<T>;
    /**
     * Creates a new query builder that can be used to build a sql query
     * @param  {string} alias
     * @param  {string} connection
     * @return {SelectQueryBuilder<T>}
     */
    protected createQueryBuilder(alias: string, connection?: string): SelectQueryBuilder<T>;
}
