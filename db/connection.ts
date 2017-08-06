import { checkAppConfig, AppProvider, Application } from '../core/app';
import { createConnection, getConnectionManager } from 'typeorm';
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

      if (connectionManager.has(connectionName) && connectionManager.get(connectionName).isConnected) {
        continue;
      }

      const conn = _.clone(dbConf.connections[connectionName]);
      conn.name = connectionName;
      conn.entities = [];

      const indexModule = require(modelsDir);
      if (!_.isNone(indexModule) && typeof indexModule == 'object') {

        for (let modelClassName in indexModule) {
          if (_.classExtends(indexModule[modelClassName], Model)) {
            conn.entities.push(indexModule[modelClassName]);
          }
        }
      }

      await createConnection(conn);
    }
  };
}
