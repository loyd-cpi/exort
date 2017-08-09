import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { QueryPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { RemoveOptions } from 'typeorm/repository/RemoveOptions';
import { Connection, EntityManager, Repository } from 'typeorm';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Service } from '../core/service';
import { Model } from './model';
/**
 * Abstract SeedService class
 */
export declare abstract class SeedService extends Service {
    /**
     * Run the seed service
     */
    abstract run(): Promise<void>;
}
/**
 * Abstract SqlService class
 */
export declare abstract class SqlService<T extends Model> extends Service {
    /**
     * Transaction key in context store
     */
    private static STORE_TRANS_KEY;
    /**
     * Model class
     */
    protected modelClass: new () => T;
    /**
     * Gets registered connection with the given name.
     * If connection name is not given then it will get a default connection.
     * Throws exception if connection with the given name was not found.
     */
    protected getConnection(name?: string): Connection;
    /**
     * Get transaction connection
     */
    protected getTransaction(): EntityManager | undefined;
    /**
     * Gets repository for the service model
     */
    protected getRepository(connection?: string): Repository<T>;
    /**
     * Creates a new query builder that can be used to build a sql query
     */
    protected createQueryBuilder(alias?: string, connection?: string): SelectQueryBuilder<T>;
    /**
     * Creates a new model instance and copies all model properties from this object into a new model
     */
    createModelInstance(attrs?: DeepPartial<T>): T;
    /**
     * Finds models that match given options.
     */
    find(options?: DeepPartial<T> | FindManyOptions<T>): Promise<T[]>;
    /**
     * Finds model by given id.
     * Optionally find options can be applied.
     */
    findOneById(id: any, options?: FindOneOptions<T>): Promise<T | undefined>;
    /**
     * Finds first model that matches given options.
     */
    findOne(options?: FindOneOptions<T>): Promise<T | undefined>;
    /**
     * Finds models that match given conditions.
     * Also counts all models that match given conditions,
     * but ignores pagination settings (from and take options).
     */
    findAndCount(options?: DeepPartial<T> | FindManyOptions<T>): Promise<[T[], number]>;
    /**
     * Finds entities by ids.
     * Optionally find options can be applied.
     */
    findByIds(ids: any[], optionsOrConditions?: FindManyOptions<T> | DeepPartial<T>): Promise<T[]>;
    /**
     * Saves a given entity in the database.
     * If entity does not exist in the database then inserts, otherwise updates.
     */
    save(entity: T, options?: SaveOptions): Promise<T>;
    /**
     * Saves all given entities in the database.
     * If entities do not exist in the database then inserts, otherwise updates.
     */
    save(entities: T[], options?: SaveOptions): Promise<T[]>;
    /**
     * Removes a given entities from the database.
     */
    remove(entities: T[], options?: RemoveOptions): Promise<T[]>;
    /**
     * Removes a given entity from the database.
     */
    remove(entity: T, options?: RemoveOptions): Promise<T>;
    /**
     * Removes entity by a given entity id.
     */
    removeById(id: any, options?: RemoveOptions): Promise<void>;
    /**
     * Removes entity by a given entity id.
     */
    removeByIds(ids: any[], options?: RemoveOptions): Promise<void>;
    /**
     * Updates entity partially. Entity can be found by a given conditions.
     */
    update(conditions: Partial<T>, partialEntity: DeepPartial<T>, options?: SaveOptions): Promise<void>;
    /**
     * Updates entity partially. Entity can be found by a given find options.
     */
    update(findOptions: FindOneOptions<T>, partialEntity: DeepPartial<T>, options?: SaveOptions): Promise<void>;
    /**
     * Updates entity partially. Entity will be found by a given id.
     */
    updateById(id: any, partialEntity: DeepPartial<T>, options?: SaveOptions): Promise<void>;
    /**
     * Executes insert query and returns raw database results.
     */
    insert(value: QueryPartialEntity<T>): Promise<any>;
    /**
     * Executes insert query and returns raw database results.
     */
    insert(values: QueryPartialEntity<T>[]): Promise<any>;
    /**
     * Make the closure run with transaction object
     */
    protected transaction<U>(closure: (this: this) => Promise<U>, connection?: string): Promise<U | undefined>;
}
