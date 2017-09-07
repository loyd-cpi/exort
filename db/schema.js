"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("../core/app");
const connection_1 = require("./connection");
const filesystem_1 = require("../core/filesystem");
const app_2 = require("../console/app");
const service_1 = require("./service");
const error_1 = require("../core/error");
const misc_1 = require("../core/misc");
/**
 * Sync schema of the connection
 */
function synchronize(app, connectionName) {
    return connection_1.getConnection(app, connectionName).synchronize();
}
exports.synchronize = synchronize;
const SEEDER_TEMPLATE = misc_1._.trimStart(`
import { SeedService } from 'exort/db';

export class {class} extends SeedService {

  public async run(): Promise<void> {

  }
}\n`);
/**
 * Provide schema commands
 */
function provideSchemaCommands(databaseSourceDir, databaseDistDir) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        if (databaseSourceDir) {
            databaseSourceDir = misc_1._.trimEnd(databaseSourceDir, '/');
        }
        else {
            databaseSourceDir = `${app.rootDir}/src/server/database`;
        }
        if (databaseDistDir) {
            databaseDistDir = misc_1._.trimEnd(databaseDistDir, '/');
        }
        else {
            databaseDistDir = `${app.dir}/database`;
        }
        app_2.Console.addCommand(app, {
            command: 'schema:sync',
            desc: 'Sync models and database schema',
            params: {
                'connection': {
                    required: false
                }
            },
            handler(argv) {
                return synchronize(app, argv.connection);
            }
        });
        app_2.Console.addCommand(app, {
            command: 'seed:run',
            desc: 'Run database seeder',
            params: {
                'class': {
                    required: false,
                    default: 'DefaultSeeder'
                }
            },
            handler(argv) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    let seederClass = misc_1._.requireClass(`${databaseDistDir}/seeds/${argv.class}`);
                    if (!misc_1._.classExtends(seederClass, service_1.SeedService)) {
                        throw new error_1.Error(`${seederClass.name} doesn't extend SeedService`);
                    }
                    yield app.context.make(seederClass).run();
                });
            }
        });
        app_2.Console.addCommand(app, {
            command: 'seed:make',
            desc: 'Create database seeder',
            params: {
                'class': {
                    required: true
                }
            },
            handler(argv) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (yield filesystem_1.File.exists(`${databaseSourceDir}/seeds/${argv.class}.ts`)) {
                        throw new error_1.Error(`${argv.class}.ts already exists`);
                    }
                    yield filesystem_1.File.create(`${databaseSourceDir}/seeds/${argv.class}.ts`, SEEDER_TEMPLATE.replace('{class}', argv.class), 'text/plain');
                });
            }
        });
    });
}
exports.provideSchemaCommands = provideSchemaCommands;
//# sourceMappingURL=schema.js.map