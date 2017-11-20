import { AppProvider, Application, checkAppConfig } from '../core/app';
import { MysqlDriver } from 'typeorm/driver/mysql/MysqlDriver';
import { CommandUtils } from 'typeorm/commands/CommandUtils';
import { Arguments } from '../console/command';
import { getConnection } from './connection';
import { File } from '../core/filesystem';
import { Console } from '../console/app';
import { SeedService } from './service';
import { Error } from '../core/error';
import { _ } from '../core/misc';

/**
 * Sync schema of the connection
 */
export async function synchronize(app: Application, connectionName?: string) {
  const connection = getConnection(app, connectionName);
  await connection.synchronize();
  await connection.close();
}

/**
 * Run migration files
 */
export async function migrate(app: Application, connectionName?: string) {
  const connection = getConnection(app, connectionName);
  await connection.runMigrations();
  await connection.close();
}

/**
 * Revert last migration
 */
export async function undoLastMigration(app: Application, connectionName?: string) {
  const connection = getConnection(app, connectionName);
  await connection.undoLastMigration();
  await connection.close();
}

/**
 * Generate migration file content
 */
export function generateMigrationContent(name: string, timestamp: number, upSqls: string[], downSqls: string[]): string {
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

/**
 * Generate migration files base from changes made in models
 */
export async function generateMigrationFiles(app: Application, className?: string, connectionName?: string) {
  className = className || 'Auto';

  const timestamp = new Date().getTime();
  const filename = `${timestamp}-${className}.ts`;
  const connection = getConnection(app, connectionName);
  const cliOptions = connection.options.cli;

  if (cliOptions) {
    try {

      const upSqls: string[] = [];
      const downSqls: string[] = [];
      const sqlQueries = await connection.driver.createSchemaBuilder().log();

      // mysql is exceptional here because it uses ` character in to escape names in queries, thats why for mysql
      // we are using simple quoted string instead of template string sytax
      if (connection.driver instanceof MysqlDriver) {
        sqlQueries.forEach(query => {
          const queryString = typeof query == 'string' ? query : query.up;
          upSqls.push(`await queryRunner.query('${queryString.replace(new RegExp(`'`, 'g'), `\\'`)}');`);
          if (typeof query != 'string' && query.down) {
            downSqls.push(`await queryRunner.query('${query.down.replace(new RegExp(`'`, 'g'), `\\'`)}');`);
          }
        });
      } else {
        sqlQueries.forEach(query => {
          const queryString = typeof query == 'string' ? query : query.up;
          upSqls.push(`await queryRunner.query(\`${queryString.replace(new RegExp('`', 'g'), '\\`')}\`);`);
          if (typeof query != "string" && query.down) {
            downSqls.push(`await queryRunner.query(\`${query.down.replace(new RegExp('`', 'g'), '\\`')}\`);`);
          }
        });
      }

      if (upSqls.length) {
        const fileContent = generateMigrationContent(className, timestamp, upSqls, downSqls);
        const path = `${cliOptions.migrationsDir}/${filename}`;
        await CommandUtils.createFile(path, fileContent);
        console.info(`Migration ${path.replace(`${app.rootDir}/`, '')} has been generated successfully.`);
      } else {
        console.warn(
          'No changes in database schema were found - cannot generate a migration. ' +
          `To create a new empty migration use "node cli migration:make" command`
        );
      }

      await connection.close();

    } catch (err) {
      await connection.close();
      console.error(err);
    }
  }
}

/**
 * Seeder template
 */
const SEEDER_TEMPLATE: string = _.trimStart(`
import { SeedService } from 'exort/db';

export class {class} extends SeedService {

  public async run(): Promise<void> {

  }
}\n`);

/**
 * Provide schema commands
 */
export function provideSchemaCommands(databaseSourceDir?: string, databaseDistDir?: string): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    if (databaseSourceDir) {
      databaseSourceDir = _.trimEnd(databaseSourceDir, '/');
    } else {
      databaseSourceDir = `${app.rootDir}/src/server/database`;
    }

    if (databaseDistDir) {
      databaseDistDir = _.trimEnd(databaseDistDir, '/');
    } else {
      databaseDistDir = `${app.dir}/database`;
    }

    Console.addCommand(app, {
      command: 'schema:sync',
      desc: 'Sync models and database schema',
      params: {
        'connection': {
          required: false
        }
      },
      handler(argv: Arguments) {
        return synchronize(app, argv.connection);
      }
    });

    Console.addCommand(app, {
      command: 'seed:run',
      desc: 'Run database seeder',
      params: {
        'class': {
          required: false,
          default: 'DefaultSeeder'
        }
      },
      async handler(argv: Arguments) {
        let seederClass = _.requireClass(`${databaseDistDir}/seeds/${argv.class}`);
        if (!_.classExtends(seederClass, SeedService)) {
          throw new Error(`${seederClass.name} doesn't extend SeedService`);
        }
        await app.context.make<SeedService>(seederClass as any).run();
      }
    });

    Console.addCommand(app, {
      command: 'seed:make',
      desc: 'Create database seeder',
      params: {
        'class': {
          required: true
        }
      },
      async handler(argv: Arguments) {
        if (await File.exists(`${databaseSourceDir}/seeds/${argv.class}.ts`)) {
          throw new Error(`${argv.class}.ts already exists`);
        }
        await File.create(`${databaseSourceDir}/seeds/${argv.class}.ts`, SEEDER_TEMPLATE.replace('{class}', argv.class), 'text/plain');
      }
    });

    Console.addCommand(app, {
      command: 'migration:make',
      desc: 'Generate migration files from model changes',
      params: {
        'class': {
          required: false
        },
        'connection': {
          require: false
        }
      },
      handler(argv: Arguments) {
        return generateMigrationFiles(app, argv.class, argv.connection);
      }
    });

    Console.addCommand(app, {
      command: 'migration:run',
      desc: 'This command will execute all pending migrations and run them in a sequence ordered by their timestamps',
      params: {
        'connection': {
          require: false
        }
      },
      handler(argv: Arguments) {
        return migrate(app, argv.connection);
      }
    });

    Console.addCommand(app, {
      command: 'migration:revert',
      desc: 'This command will execute down in the latest executed migration',
      params: {
        'connection': {
          require: false
        }
      },
      handler(argv: Arguments) {
        return undoLastMigration(app, argv.connection);
      }
    });
  };
}
