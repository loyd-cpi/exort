import { checkAppConfig, AppProvider, Application } from '../core/app';
import { KeyValuePair, _ } from '../core/misc';
import { createConnection } from 'typeorm';

/**
 * Provide sql connection
 */
export function provideSqlConnection(modelsDir: string | KeyValuePair<string | string[]>): AppProvider {
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
