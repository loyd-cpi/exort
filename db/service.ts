import { Connection, EntityManager, Repository, getConnectionManager } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { QueryPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { RemoveOptions } from 'typeorm/repository/RemoveOptions';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Service } from '../core/service';
import { Model } from './model';

/**
 * Abstract SeedService class
 */
export abstract class SeedService extends Service {

  /**
   * Run the seed service
   */
  public abstract async run(): Promise<void>;
}

/**
 * Abstract SqlService class
 */
export abstract class SqlService<T extends Model> extends Service {

  /**
   * Transaction key in context store
   */
  private static STORE_TRANS_KEY: string = '$exort:transaction';

  /**
   * Model class
   */
  protected modelClass: new() => T;

  /**
   * Gets registered connection with the given name.
   * If connection name is not given then it will get a default connection.
   * Throws exception if connection with the given name was not found.
   */
  protected getConnection(name?: string): Connection {
    return getConnectionManager().get(name);
  }

  /**
   * Get transaction connection
   */
  protected getTransaction(): EntityManager | undefined {
    return this.context.store.get(SqlService.STORE_TRANS_KEY);
  }

  /**
   * Gets repository for the service model
   */
  protected getRepository(connection?: string): Repository<T> {
    let transaction = this.getTransaction();
    if (transaction && (!connection || transaction.connection.name == connection)) {
      return transaction.getRepository(this.modelClass);
    }
    return this.getConnection(connection).getRepository(this.modelClass);
  }

  /**
   * Creates a new query builder that can be used to build a sql query
   */
  protected createQueryBuilder(alias: string, connection?: string): SelectQueryBuilder<T> {
    return this.getRepository(connection).createQueryBuilder(alias);
  }

  /**
   * Creates a new model instance and copies all model properties from this object into a new model
   */
  public createModelInstance(attrs?: DeepPartial<T>): T {
    return this.getRepository().create(attrs || {});
  }

  /**
   * Finds models that match given options.
   */
  public find(options?: DeepPartial<T> | FindManyOptions<T>): Promise<T[]> {
    return this.getRepository().find(options as DeepPartial<T>);
  }

  /**
   * Finds model by given id.
   * Optionally find options can be applied.
   */
  public findOneById(id: any, options?: FindOneOptions<T>): Promise<T | undefined> {
    return this.getRepository().findOneById(id, options);
  }

  /**
   * Finds first model that matches given options.
   */
  public findOne(options?: FindOneOptions<T>): Promise<T | undefined>  {
    return this.getRepository().findOne(options);
  }

  /**
   * Finds models that match given conditions.
   * Also counts all models that match given conditions,
   * but ignores pagination settings (from and take options).
   */
  public findAndCount(options?: DeepPartial<T> | FindManyOptions<T>): Promise<[T[], number]> {
    return this.getRepository().findAndCount(options as DeepPartial<T>);
  }

  /**
   * Finds entities by ids.
   * Optionally find options can be applied.
   */
  public findByIds(ids: any[], optionsOrConditions?: FindManyOptions<T> | DeepPartial<T>): Promise<T[]> {
    return this.getRepository().findByIds(ids, optionsOrConditions as any);
  }

  /**
   * Saves a given entity in the database.
   * If entity does not exist in the database then inserts, otherwise updates.
   */
  public save(entity: T, options?: SaveOptions): Promise<T>;

  /**
   * Saves all given entities in the database.
   * If entities do not exist in the database then inserts, otherwise updates.
   */
  public save(entities: T[], options?: SaveOptions): Promise<T[]>;

  /**
   * Saves one or many given entities.
   */
  public save(entityOrEntities: T | T[], options?: SaveOptions): Promise<T | T[]> {
    return this.getRepository().persist(entityOrEntities as any, options);
  }

  /**
   * Removes a given entities from the database.
   */
  public remove(entities: T[], options?: RemoveOptions): Promise<T[]>;

  /**
   * Removes a given entity from the database.
   */
  public remove(entity: T, options?: RemoveOptions): Promise<T>;

  /**
   * Removes one or many given entities.
   */
  public remove(entityOrEntities: T | T[], options?: RemoveOptions): Promise<T | T[]> {
    return this.getRepository().remove(entityOrEntities as any, options);
  }

  /**
   * Removes entity by a given entity id.
   */
  public removeById(id: any, options?: RemoveOptions): Promise<void> {
    return this.getRepository().removeById(id, options);
  }

  /**
   * Removes entity by a given entity id.
   */
  public removeByIds(ids: any[], options?: RemoveOptions): Promise<void> {
    return this.getRepository().removeByIds(ids, options);
  }

  /**
   * Updates entity partially. Entity can be found by a given conditions.
   */
  public update(conditions: Partial<T>, partialEntity: DeepPartial<T>, options?: SaveOptions): Promise<void>;

  /**
   * Updates entity partially. Entity can be found by a given find options.
   */
  public update(findOptions: FindOneOptions<T>, partialEntity: DeepPartial<T>, options?: SaveOptions): Promise<void>;

  /**
   * Updates entity partially. Entity can be found by a given conditions.
   */
  public update(conditionsOrFindOptions: Partial<T> | FindOneOptions<T>, partialEntity: DeepPartial<T>, options?: SaveOptions): Promise<void> {
    return this.getRepository().update(conditionsOrFindOptions as any, partialEntity, options);
  }

  /**
   * Updates entity partially. Entity will be found by a given id.
   */
  public updateById(id: any, partialEntity: DeepPartial<T>, options?: SaveOptions): Promise<void> {
    return this.getRepository().updateById(id, partialEntity, options);
  }

  /**
   * Executes insert query and returns raw database results.
   */
  public insert(value: QueryPartialEntity<T>): Promise<any>;

  /**
   * Executes insert query and returns raw database results.
   */
  public insert(values: QueryPartialEntity<T>[]): Promise<any>;

  /**
   * Executes insert query and returns raw database results.
   */
  public insert(values: QueryPartialEntity<T> | QueryPartialEntity<T>[]) {
    return this.createQueryBuilder(this.modelClass.name).insert().into(this.modelClass).values(values as QueryPartialEntity<T>[]).execute();
  }

  /**
   * Make the closure run with transaction object
   */
  protected async transaction<U>(closure: (this: this) => Promise<U>, connection?: string): Promise<U | undefined> {
    let result;
    await this.getConnection(connection).transaction(async (transaction: EntityManager) => {

      const newContext = this.context.newInstance();
      newContext.store.set(SqlService.STORE_TRANS_KEY, transaction);

      const startingService = newContext.make<this>((this as any).constructor);
      try {
        result = await closure.call(startingService);
      } finally {
        newContext.store.delete(SqlService.STORE_TRANS_KEY);
      }
    });

    return result;
  }
}
