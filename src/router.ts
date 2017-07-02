import { checkAppConfig, Application, AppProvider } from './app';

/**
 * Provide routes
 * @param  {string} routesFile
 * @return {AppProvider}
 */
export function provideRoutes(routesFile: string): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    let routes = require(routesFile);
    if (typeof routes != 'object') {
      throw new Error('Invalid routes file');
    }

    if (typeof routes.setup == 'function') {
      routes.setup(app);
    }
  };
}
