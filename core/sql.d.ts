import { Connection, Repository } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { AppProvider } from './app';
import { DeepPartial } from 'typeorm/common/DeepPartial';
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
     * Gets repository for the service model
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
    /**
     * Creates a new model instance and copies all model properties from this object into a new model
     * @param  {DeepPartial<T>} attrs
     * @return {T}
     */
    createModelInstance(attrs?: DeepPartial<T>): T;
    /**
     * Finds models that match given options.
     * @param  {FindManyOptions<T> | DeepPartial<T>} options
     * @return {Promise<T[]>}
     */
    find(options?: DeepPartial<T> | FindManyOptions<T>): Promise<T[]>;
    /**
     * Finds model by given id.
     * Optionally find options can be applied.
     * @param  {any} id
     * @param  {FindOneOptions<T>} options
     * @return {Promise<T | undefined>}
     */
    findOneById(id: any, options?: FindOneOptions<T>): Promise<T | undefined>;
    /**
     * Finds first model that matches given options.
     * @param  {FindOneOptions<T>} options
     * @return {Promise<T | undefined>}
     */
    findOne(options?: FindOneOptions<T>): Promise<T | undefined>;
    /**
     * Finds models that match given conditions.
     * Also counts all models that match given conditions,
     * but ignores pagination settings (from and take options).
     * @param  {FindManyOptions<T> | DeepPartial<T>} options
     * @return {Promise<[Entity[], number]>}
     */
    findAndCount(options?: DeepPartial<T> | FindManyOptions<T>): Promise<[T[], number]>;
}
