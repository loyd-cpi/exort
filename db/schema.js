"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("../core/app");
const MysqlDriver_1 = require("typeorm/driver/mysql/MysqlDriver");
const CommandUtils_1 = require("typeorm/commands/CommandUtils");
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
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const connection = connection_1.getConnection(app, connectionName);
        yield connection.synchronize();
        yield connection.close();
    });
}
exports.synchronize = synchronize;
/**
 * Run migration files
 */
function migrate(app, connectionName) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const connection = connection_1.getConnection(app, connectionName);
        yield connection.runMigrations();
        yield connection.close();
    });
}
exports.migrate = migrate;
/**
 * Revert last migration
 */
function undoLastMigration(app, connectionName) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const connection = connection_1.getConnection(app, connectionName);
        yield connection.undoLastMigration();
        yield connection.close();
    });
}
exports.undoLastMigration = undoLastMigration;
/**
 * Generate migration file content
 */
function generateMigrationContent(name, timestamp, upSqls, downSqls) {
    return `import { MigrationInterface, QueryRunner } from 'exort/db';

export class ${name}${timestamp} implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    ${upSqls.join(`\n    `)}
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    ${downSqls.reverse().join(`\n    `)}
  }
}\n`;
}
exports.generateMigrationContent = generateMigrationContent;
/**
 * Generate migration files base from changes made in models
 */
function generateMigrationFiles(app, className, connectionName) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        className = className || 'Auto';
        const timestamp = new Date().getTime();
        const filename = `${timestamp}-${className}.ts`;
        const connection = connection_1.getConnection(app, connectionName);
        const cliOptions = connection.options.cli;
        if (cliOptions) {
            try {
                const upSqls = [];
                const downSqls = [];
                const sqlQueries = yield connection.driver.createSchemaBuilder().log();
                // mysql is exceptional here because it uses ` character in to escape names in queries, thats why for mysql
                // we are using simple quoted string instead of template string sytax
                if (connection.driver instanceof MysqlDriver_1.MysqlDriver) {
                    sqlQueries.forEach(query => {
                        const queryString = typeof query == 'string' ? query : query.up;
                        upSqls.push('await queryRunner.query(\"' + queryString.replace(new RegExp(`"`, 'g'), `\\"`) + '\");');
                        if (typeof query != 'string' && query.down) {
                            downSqls.push('await queryRunner.query(\"' + query.down.replace(new RegExp(`"`, 'g'), `\\"`) + '\");');
                        }
                    });
                }
                else {
                    sqlQueries.forEach(query => {
                        const queryString = typeof query == 'string' ? query : query.up;
                        upSqls.push('await queryRunner.query(`' + queryString.replace(new RegExp('`', 'g'), '\\`') + '`);');
                        if (typeof query != "string" && query.down) {
                            downSqls.push('await queryRunner.query(`' + query.down.replace(new RegExp('`', 'g'), '\\`') + '`);');
                        }
                    });
                }
                if (upSqls.length) {
                    const fileContent = generateMigrationContent(className, timestamp, upSqls, downSqls);
                    const path = `${cliOptions.migrationsDir}/${filename}`;
                    yield CommandUtils_1.CommandUtils.createFile(path, fileContent);
                    console.info(`Migration ${path.replace(`${app.rootDir}/`, '')} has been generated successfully.`);
                }
                else {
                    console.warn('No changes in database schema were found - cannot generate a migration. ' +
                        `To create a new empty migration use "node cli migration:make" command`);
                }
                yield connection.close();
            }
            catch (err) {
                yield connection.close();
                console.error(err);
            }
        }
    });
}
exports.generateMigrationFiles = generateMigrationFiles;
/**
 * Seeder template
 */
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
        app_2.Console.addCommand(app, {
            command: 'migration:generate',
            desc: 'Generate migration files from model changes',
            params: {
                'class': {
                    required: false
                },
                'connection': {
                    require: false
                }
            },
            handler(argv) {
                return generateMigrationFiles(app, argv.class, argv.connection);
            }
        });
        app_2.Console.addCommand(app, {
            command: 'migration:run',
            desc: 'This command will execute all pending migrations and run them in a sequence ordered by their timestamps',
            params: {
                'connection': {
                    require: false
                }
            },
            handler(argv) {
                return migrate(app, argv.connection);
            }
        });
        app_2.Console.addCommand(app, {
            command: 'migration:revert',
            desc: 'This command will execute down in the latest executed migration',
            params: {
                'connection': {
                    require: false
                }
            },
            handler(argv) {
                return undoLastMigration(app, argv.connection);
            }
        });
    });
}
exports.provideSchemaCommands = provideSchemaCommands;
//# sourceMappingURL=schema.js.map