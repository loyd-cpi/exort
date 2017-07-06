import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { Connection, Repository, getConnectionManager } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { RemoveOptions } from 'typeorm/repository/RemoveOptions';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Service } from '../core/service';
import { Model } from '../core/model';

/**
 * Abstract SqlService class
 */
export abstract class SqlService<T extends Model> extends Service {

  /**
   * Model class
   */
  protected modelClass: new() => T;

  /**
   * Gets registered connection with the given name.
   * If connection name is not given then it will get a default connection.
   * Throws exception if connection with the given name was not found.
   */
  protected getConnection(name: string = 'default'): Connection {
    return getConnectionManager().get(name);
  }

  /**
   * Gets repository for the service model
   */
  protected getRepository(connection: string = 'default'): Repository<T> {
    return this.getConnection(connection).getRepository(this.modelClass);
  }

  /**
   * Creates a new query builder that can be used to build a sql query
   */
  protected createQueryBuilder(alias: string, connection: string = 'default'): SelectQueryBuilder<T> {
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
}
