"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const app_1 = require("../core/app");
const misc_1 = require("../core/misc");
const model_1 = require("./model");
/**
 * Default connection name
 */
exports.DEFAULT_CONNECTION_NAME = 'default';
/**
 * Provide sql and nosql connection
 */
function provideConnection(modelsDir, migrationsReadDir, migrationsWriteDir) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        const dbConf = app.config.get('db');
        if (!dbConf || !Array.isArray(dbConf.auto))
            return;
        if (modelsDir) {
            modelsDir = misc_1._.trimEnd(modelsDir, '/');
        }
        else {
            modelsDir = `${app.dir}/models`;
        }
        if (migrationsReadDir) {
            migrationsReadDir = misc_1._.trimEnd(migrationsReadDir, '/');
        }
        else {
            migrationsReadDir = `${app.dir}/database/migrations`;
        }
        if (migrationsWriteDir) {
            migrationsWriteDir = misc_1._.trimEnd(migrationsWriteDir, '/');
        }
        else {
            migrationsWriteDir = `${app.rootDir}/src/server/database/migrations`;
        }
        const connectionManager = typeorm_1.getConnectionManager();
        for (let connectionName of dbConf.auto) {
            const prefixedName = `${app.id}:${connectionName}`;
            if (connectionManager.has(prefixedName) && connectionManager.get(prefixedName).isConnected) {
                continue;
            }
            const conn = misc_1._.clone(dbConf.connections[connectionName]);
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
            if (!misc_1._.isNone(indexModule) && typeof indexModule == 'object') {
                for (let modelClassName in indexModule) {
                    if (misc_1._.classExtends(indexModule[modelClassName], model_1.Model)) {
                        conn.entities.push(indexModule[modelClassName]);
                    }
                }
            }
            if (app.testMode) {
                delete conn.logging;
            }
            yield typeorm_1.createConnection(conn);
        }
    });
}
exports.provideConnection = provideConnection;
/**
 * Get connection from specified application instance
 */
function getConnection(app, name) {
    app_1.checkAppConfig(app);
    return typeorm_1.getConnectionManager().get(`${app.id}:${name || exports.DEFAULT_CONNECTION_NAME}`);
}
exports.getConnection = getConnection;
//# sourceMappingURL=connection.js.map