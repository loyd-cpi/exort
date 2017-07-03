import { createConnection, Connection, Repository, getConnectionManager } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { checkAppConfig, AppProvider, Application } from './app';
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
 * Abstract SQLService class
 */
export abstract class SQLService<T extends Model> extends Service {

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
   * Gets repository for the service entity
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
}
