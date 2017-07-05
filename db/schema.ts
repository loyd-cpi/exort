import { AppProvider, Application } from '../core/app';
import { Console, Argv } from '../core/command';
import { getConnectionManager } from 'typeorm';

/**
 * Sync schema of the connection
 */
export async function syncSchema(connectionName?: string): Promise<void> {
  await getConnectionManager().get(connectionName).syncSchema();
}

/**
 * Provide schema commands
 */
export function provideSchemaCommands(): AppProvider {
  return async (app: Application): Promise<void> => {

    Console.addCommand({
      command: 'sync:schema',
      desc: 'Sync models and database schema',
      params: {
        'connection': {
          required: false
        }
      },
      async handler(argv: Argv) {
        await syncSchema(argv.connection);
      }
    });
  };
}
