import { checkAppConfig, AppProvider, Application } from '../core/app';
import { createConnection, getConnectionManager } from 'typeorm';
import { KeyValuePair, _ } from '../core/misc';
import { Model } from './model';

/**
 * Provide sql and nosql connection
 */
export function provideConnection(modelsDir?: string): AppProvider;

/**
 * Provide sql and nosql connection
 */
export function provideConnection(modelsDir?: KeyValuePair<string | string[]>): AppProvider;

/**
 * Provide sql and nosql connection
 */
export function provideConnection(modelsDir?: string | KeyValuePair<string | string[]>): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    modelsDir = modelsDir || `${app.dir}/models`;

    const connectionManager = getConnectionManager();
    const dbConf = app.config.get('db');

    for (let connectionName of dbConf.auto) {

      if (connectionManager.has(connectionName) && connectionManager.get(connectionName).isConnected) continue;

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

          for (let modelClassName in indexModule) {
            if (_.classExtends(indexModule[modelClassName], Model)) {
              conn.entities.push(indexModule[modelClassName]);
            }
          }
        }
      }

      await createConnection(conn);
    }
  };
}
