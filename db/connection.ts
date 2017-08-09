import { createConnection, getConnectionManager, Connection } from 'typeorm';
import { checkAppConfig, AppProvider, Application } from '../core/app';
import { _ } from '../core/misc';
import { Model } from './model';

/**
 * Provide sql and nosql connection
 */
export function provideConnection(modelsDir?: string): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    const dbConf = app.config.get('db');
    if (!dbConf || !Array.isArray(dbConf.auto)) return;

    if (modelsDir) {
      modelsDir = _.trimEnd(modelsDir, '/');
    } else {
      modelsDir = `${app.dir}/models`;
    }

    const connectionManager = getConnectionManager();
    for (let connectionName of dbConf.auto) {

      const prefixedName = `${app.id}:${connectionName}`;
      if (connectionManager.has(prefixedName) && connectionManager.get(prefixedName).isConnected) {
        continue;
      }

      const conn = _.clone(dbConf.connections[connectionName]);
      conn.name = prefixedName;
      conn.entities = [];

      const indexModule = require(modelsDir);
      if (!_.isNone(indexModule) && typeof indexModule == 'object') {

        for (let modelClassName in indexModule) {
          if (_.classExtends(indexModule[modelClassName], Model)) {
            conn.entities.push(indexModule[modelClassName]);
          }
        }
      }

      if (app.testMode) {
        delete conn.logging;
      }

      await createConnection(conn);
    }
  };
}

/**
 * Get connection from specified application instance
 */
export function getConnection(app: Application, name?: string): Connection {
  checkAppConfig(app);
  return getConnectionManager().get(`${app.id}:${name || 'default'}`);
}
