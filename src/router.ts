import { checkAppConfig, Application, AppProvider } from './app';
import { Request, HttpError, Response } from './http';
import { FormValidationError } from './validation';
import * as express from 'express';


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

    app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {

      let details: any = {
        name: err.name,
        message: err.message,
      };

      if (app.config.get('app.env') != 'production') {
        details.stack = err.stack;
      }

      if (err instanceof FormValidationError) {
        details.fields = err.fields;
        res.status(400);
      } else if (err instanceof HttpError) {
        res.status(err.statusCode);
      } else {
        res.status(500);
      }

      if (req.accepts('json')) {
        res.json({ error: details });
      } else if (req.accepts('html')) {
        res.render(`errors/${res.statusCode}`, { error: details });
      } else {
        res.send(JSON.stringify(details));
      }
    });
  };
}
