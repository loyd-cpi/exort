import { Config, checkAppConfig, AppProvider } from './boot';
import { createConnection } from 'typeorm';
import { KeyValuePair, _ } from './misc';
import * as express from 'express';

/**
 * Provide sql connection
 * @param  {string | KeyValuePair<string | string[]>} modelsDir
 * @return {AppProvider<T>}
 */
export function provideSQLConnection<T extends express.Server>(modelsDir: string | KeyValuePair<string | string[]>): AppProvider<T> {
  return async function (app: T): Promise<void> {
    checkAppConfig(app);

    let config: Config = app.locals.config;
    let dbConf = config.get('db');
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
