"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const app_1 = require("../core/app");
const misc_1 = require("../core/misc");
const model_1 = require("./model");
/**
 * Provide sql and nosql connection
 */
function provideConnection(modelsDir) {
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
        const connectionManager = typeorm_1.getConnectionManager();
        for (let connectionName of dbConf.auto) {
            const prefixedName = `${app.id}:${connectionName}`;
            if (connectionManager.has(prefixedName) && connectionManager.get(prefixedName).isConnected) {
                continue;
            }
            const conn = misc_1._.clone(dbConf.connections[connectionName]);
            conn.name = prefixedName;
            conn.entities = [];
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
    return typeorm_1.getConnectionManager().get(`${app.id}:${name || 'default'}`);
}
exports.getConnection = getConnection;
//# sourceMappingURL=connection.js.map