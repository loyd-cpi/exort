import { createConnection, Connection, Repository, getConnectionManager } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { checkAppConfig, AppProvider, Application } from './app';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Model, Service } from './service';
import { KeyValuePair, _ } from './misc';

/**
 * Provide sql connection
 * @param  {string | KeyValuePair<string | string[]>} modelsDir
 * @return {AppProvider<T>}
 */
export function provideSQLConnection(modelsDir: string | KeyValuePair<string | string[]>): AppProvider {
  return async function (app: Application): Promise<void> {
    checkAppConfig(app);

    let dbConf = app.config.get('db');
    for (let connectionName of dbConf.auto) {

      let conn = _.clone(dbConf.connections[connectionName]);
      conn.name = connectionName;
      conn.entities = [];

      let dirs: string[] = [];
      if (typeof modelsDir == 'string') {
        dirs.push(modelsDir);
      } else if (typeof modelsDir == 'object' && typeof modelsDir[connectionName] != 'undefined') {
        if (typeof modelsDir[connectionName] == 'string') {
          dirs.push(modelsDir[connectionName] as string);
        } else if (Array.isArray(modelsDir[connectionName])) {
          dirs = dirs.concat(modelsDir[connectionName]);
        }
      }

      for (let dir of dirs) {
        let indexModule = require(dir);
        if (!_.isNone(indexModule) && typeof indexModule == 'object') {
          conn.entities = conn.entities.concat((Object as any).values(indexModule));
        }
      }

      await createConnection(conn);
    }
  };
}

/**
 * Sync schema of the connection
 * @param  {string} connectionName
 * @return {Promise<void>}
 */
export async function syncSchema(connectionName?: string): Promise<void> {
  await getConnectionManager().get(connectionName).syncSchema();
}

/**
 * Abstract SqlService class
 */
export abstract class SqlService<T extends Model> extends Service {

  /**
   * Model class
   * @type {(new() => T)}
   */
  protected modelClass: new() => T;

  /**
   * Gets registered connection with the given name.
   * If connection name is not given then it will get a default connection.
   * Throws exception if connection with the given name was not found.
   * @param  {string} name
   * @return {Connection}
   */
  protected getConnection(name: string = 'default'): Connection {
    return getConnectionManager().get(name);
  }

  /**
   * Gets repository for the service model
   * @param  {string} connection
   * @return {Repository<T>}
   */
  protected getRepository(connection: string = 'default'): Repository<T> {
    return this.getConnection(connection).getRepository(this.modelClass);
  }

  /**
   * Creates a new query builder that can be used to build a sql query
   * @param  {string} alias
   * @param  {string} connection
   * @return {SelectQueryBuilder<T>}
   */
  protected createQueryBuilder(alias: string, connection: string = 'default'): SelectQueryBuilder<T> {
    return this.getRepository(connection).createQueryBuilder(alias);
  }

  /**
   * Creates a new model instance and copies all model properties from this object into a new model
   * @param  {DeepPartial<T>} attrs
   * @return {T}
   */
  public createModelInstance(attrs?: DeepPartial<T>): T {
    return this.getRepository().create(attrs || {});
  }

  /**
   * Finds models that match given options.
   * @param  {FindManyOptions<T> | DeepPartial<T>} options
   * @return {Promise<T[]>}
   */
  public find(options?: DeepPartial<T> | FindManyOptions<T>): Promise<T[]> {
    return this.getRepository().find(options as DeepPartial<T>);
  }

  /**
   * Finds model by given id.
   * Optionally find options can be applied.
   * @param  {any} id
   * @param  {FindOneOptions<T>} options
   * @return {Promise<T | undefined>}
   */
  public findOneById(id: any, options?: FindOneOptions<T>): Promise<T | undefined> {
    return this.getRepository().findOneById(id, options);
  }

  /**
   * Finds first model that matches given options.
   * @param  {FindOneOptions<T>} options
   * @return {Promise<T | undefined>}
   */
  public findOne(options?: FindOneOptions<T>): Promise<T | undefined>  {
    return this.getRepository().findOne(options);
  }

  /**
   * Finds models that match given conditions.
   * Also counts all models that match given conditions,
   * but ignores pagination settings (from and take options).
   * @param  {FindManyOptions<T> | DeepPartial<T>} options
   * @return {Promise<[Entity[], number]>}
   */
  public findAndCount(options?: DeepPartial<T> | FindManyOptions<T>): Promise<[T[], number]> {
    return this.getRepository().findAndCount(options as DeepPartial<T>);
  }
}
