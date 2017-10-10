import { createConnection, getConnectionManager, Connection } from 'typeorm';
import { checkAppConfig, AppProvider, Application } from '../core/app';
import { _ } from '../core/misc';
import { Model } from './model';

/**
 * Default connection name
 */
export const DEFAULT_CONNECTION_NAME: string = 'default';

/**
 * Provide sql and nosql connection
 */
export function provideConnection(modelsDir?: string, migrationsReadDir?: string, migrationsWriteDir?: string): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    const dbConf = app.config.get('db');
    if (!dbConf || !Array.isArray(dbConf.auto)) return;

    if (modelsDir) {
      modelsDir = _.trimEnd(modelsDir, '/');
    } else {
      modelsDir = `${app.dir}/models`;
    }

    if (migrationsReadDir) {
      migrationsReadDir = _.trimEnd(migrationsReadDir, '/');
    } else {
      migrationsReadDir = `${app.dir}/database/migrations`;
    }

    if (migrationsWriteDir) {
      migrationsWriteDir = _.trimEnd(migrationsWriteDir, '/');
    } else {
      migrationsWriteDir = `${app.rootDir}/src/server/database/migrations`;
    }

    const connectionManager = getConnectionManager();
    for (let connectionName of dbConf.auto) {

      const prefixedName = `${app.id}:${connectionName}`;
      if (connectionManager.has(prefixedName) && connectionManager.get(prefixedName).isConnected) {
        continue;
      }

      const conn = _.clone(dbConf.connections[connectionName]);
      conn.name = prefixedName;
      conn.synchronize = false;
      conn.migrationsRun = false;
      conn.dropSchema = false;
      conn.entities = [];
      conn.migrations = [`${migrationsReadDir}/*.js`];
      conn.cli = {
        migrationsDir: migrationsWriteDir
      };

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
 * Compose prefixed connection name
 */
export function prefixConnectionName(app: Application, name?: string): string {
  return `${app.id}:${name || DEFAULT_CONNECTION_NAME}`;
}

/**
 * Get connection from specified application instance
 */
export function getConnection(app: Application, name?: string): Connection {
  checkAppConfig(app);
  return getConnectionManager().get(prefixConnectionName(app, name));
}
