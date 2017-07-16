"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("../core/app");
const misc_1 = require("../core/misc");
const typeorm_1 = require("typeorm");
/**
 * Provide sql and nosql connection
 */
function provideConnection(modelsDir) {
    return function (app) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
exports.provideConnection = provideConnection;
//# sourceMappingURL=connection.js.map