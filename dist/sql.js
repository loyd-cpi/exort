"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const typeorm_1 = require("typeorm");
const misc_1 = require("./misc");
/**
 * Provide sql connection
 * @param  {string | KeyValuePair<string | string[]>} modelsDir
 * @return {AppProvider<T>}
 */
function provideSQLConnection(modelsDir) {
    return function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            app_1.checkAppConfig(app);
            let dbConf = app.config.get('db');
            for (let connectionName of dbConf.auto) {
                let conn = misc_1._.clone(dbConf.connections[connectionName]);
                conn.name = connectionName;
                conn.entities = [];
                let dirs = [];
                if (typeof modelsDir == 'string') {
                    dirs.push(modelsDir);
                }
                else if (typeof modelsDir == 'object' && typeof modelsDir[connectionName] != 'undefined') {
                    if (typeof modelsDir[connectionName] == 'string') {
                        dirs.push(modelsDir[connectionName]);
                    }
                    else if (Array.isArray(modelsDir[connectionName])) {
                        dirs = dirs.concat(modelsDir[connectionName]);
                    }
                }
                for (let dir of dirs) {
                    let indexModule = require(dir);
                    if (!misc_1._.isNone(indexModule) && typeof indexModule == 'object') {
                        conn.entities = conn.entities.concat(Object.values(indexModule));
                    }
                }
                yield typeorm_1.createConnection(conn);
            }
        });
    };
}
exports.provideSQLConnection = provideSQLConnection;
/**
 * Sync schema of the connection
 * @param  {string} connectionName
 * @return {Promise<void>}
 */
function syncSchema(connectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield typeorm_1.getConnectionManager().get(connectionName).syncSchema();
    });
}
exports.syncSchema = syncSchema;
//# sourceMappingURL=sql.js.map