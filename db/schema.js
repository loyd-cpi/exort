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
const command_1 = require("../core/command");
const typeorm_1 = require("typeorm");
const filesystem_1 = require("../core/filesystem");
const service_1 = require("./service");
const misc_1 = require("../core/misc");
/**
 * Sync schema of the connection
 */
function syncSchema(connectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield typeorm_1.getConnectionManager().get(connectionName).syncSchema();
    });
}
exports.syncSchema = syncSchema;
const SEEDER_TEMPLATE = misc_1._.trimStart(`
import { Injectable, Context } from 'exort/core';
import { SeedService } from 'exort/db';

@Injectable()
export default class {class} extends SeedService {

  constructor(context: Context) {
    super(context);
  }

  public async run(): Promise<void> {

  }
}\n`);
/**
 * Provide schema commands
 */
function provideSchemaCommands(databaseSourceDir, databaseDistDir) {
    databaseSourceDir = misc_1._.trimEnd(databaseSourceDir, '/');
    databaseDistDir = misc_1._.trimEnd(databaseDistDir, '/');
    return (app) => __awaiter(this, void 0, void 0, function* () {
        command_1.Console.addCommand({
            command: 'schema:sync',
            desc: 'Sync models and database schema',
            params: {
                'connection': {
                    required: false
                }
            },
            handler(argv) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield syncSchema(argv.connection);
                });
            }
        });
        command_1.Console.addCommand({
            command: 'seed:run',
            desc: 'Run database seeder',
            params: {
                'class': {
                    required: false,
                    default: 'DefaultSeeder'
                }
            },
            handler(argv) {
                return __awaiter(this, void 0, void 0, function* () {
                    let seederClass = misc_1._.requireClass(`${databaseDistDir}/seeds/${argv.class}`);
                    if (!misc_1._.classExtends(seederClass, service_1.SeedService)) {
                        throw new Error(`${seederClass.name} doesn't extend SeedService`);
                    }
                    yield app.context.make(seederClass).run();
                });
            }
        });
        command_1.Console.addCommand({
            command: 'seed:make',
            desc: 'Create database seeder',
            params: {
                'class': {
                    required: true
                }
            },
            handler(argv) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (yield filesystem_1.File.exists(`${databaseSourceDir}/seeds/${argv.class}.ts`)) {
                        throw new Error(`${argv.class}.ts already exists`);
                    }
                    yield filesystem_1.File.create(`${databaseSourceDir}/seeds/${argv.class}.ts`, SEEDER_TEMPLATE.replace('{class}', argv.class), 'text/plain');
                });
            }
        });
    });
}
exports.provideSchemaCommands = provideSchemaCommands;
//# sourceMappingURL=schema.js.map