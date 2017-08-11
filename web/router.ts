import { HttpMiddleware, HttpController } from './handler';
import { checkAppConfig, AppProvider } from '../core/app';
import { Request, Response } from './http';
import { WebApplication } from './app';
import { Error } from '../core/error';
import * as express from 'express';
import { _ } from '../core/misc';

/**
 * Provide routes
 */
export function provideRoutes(routesModule?: string, controllersDir?: string, middlewareDir?: string): AppProvider {
  return async (app: WebApplication): Promise<void> => {
    checkAppConfig(app);

    if (controllersDir) {
      controllersDir = _.trimEnd(controllersDir, '/');
    } else {
      controllersDir = `${app.bootDir}/controllers`;
    }

    if (middlewareDir) {
      middlewareDir = _.trimEnd(middlewareDir, '/');
    } else {
      middlewareDir = `${app.bootDir}/middleware`;
    }

    let routes = require(routesModule || `${app.bootDir}/routes`);
    if (typeof routes != 'object') {
      throw new Error('Invalid routes file');
    }

    if (typeof routes.setup == 'function') {
      let router = new Router(app.config.get('router', {}), controllersDir, middlewareDir);
      routes.setup(router, app);
      app.use(router.getExpressRouter());
    }
  };
}

/**
 * RouterOptions interface
 */
export interface RouterOptions extends express.RouterOptions {}

/**
 * RouterOptions interfaces
 */
export interface RouterOptions extends express.RouterOptions {
  prefix?: string;
  namespace?: string;
}

/**
 * RouteGroupOptions interface
 */
export interface RouteGroupOptions {
  prefix?: string;
  namespace?: string;
}

/**
 * RouteGroupClosure interface
 */
export interface RouteGroupClosure {
  (router: Router): void;
}

/**
 * Router class
 */
export class Router {

  /**
   * Express router instance
   */
  private expressRouter: express.Router;

  /**
   * Middleware request handlers
   */
  private middlewareHandlers: express.RequestHandler[] = [];

  /**
   * Router constructor
   */
  constructor(private options: RouterOptions, private controllersDir: string, private middlewareDir: string) {
    this.expressRouter = express.Router(options);
    this.options.prefix = _.trim(this.options.prefix || '', '/');
    this.options.namespace = _.trim(this.options.namespace || '', '/');
  }

  /**
   * Get express.Router
   */
  public getExpressRouter(): express.Router {
    return this.expressRouter;
  }

  /**
   * Set global route middleware for this current Router instance
   */
  public middleware(handler: express.RequestHandler): void;

  /**
   * Set global route middleware for this current Router instance
   */
  public middleware(className: string): void;

  /**
   * Set global route middleware for this current Router instance
   */
  public middleware(classNameOrHandler: string | express.RequestHandler) {
    if (typeof classNameOrHandler == 'string') {
      classNameOrHandler = this.findRouteMiddleware(classNameOrHandler);
    }
    this.middlewareHandlers.push(classNameOrHandler);
  }

  /**
   * Resolve and return middleware instance
   */
  private findRouteMiddleware(className: string) {
    const middlewareClass = _.requireClass(`${this.middlewareDir}/${className}`);
    if (!_.classExtends(middlewareClass, HttpMiddleware)) {
      throw new Error(`${className} doesn't extend HttpMiddleware`)
    }

    return (request: Request, response: Response, next: express.NextFunction) => {
      let middlewareInstance = Reflect.construct(middlewareClass, [request, response]);
      let handleRet = middlewareInstance.handle(next);
      if (handleRet instanceof Promise) {
        handleRet.catch(err => next(err));
      }
    };
  }

  /**
   * Set route using custom method
   */
  public route(method: string, path: string, controller: string, middleware?: (string | express.RequestHandler)[]) {
    const [controllerName, actionName] = controller.split('@');
    const controllerClass = _.requireClass(`${this.controllersDir}${this.namespace(controllerName)}`);

    if (!_.classExtends(controllerClass, HttpController)) {
      throw new Error(`${controllerName} doesn't extend HttpController`);
    }

    if (typeof controllerClass.prototype[actionName] != 'function') {
      throw new Error(`${controllerClass.name} doesn't have ${actionName} method`);
    }

    const middlewareHandlers: express.RequestHandler[] = [];
    if (Array.isArray(middleware)) {
      for (let mware of middleware) {
        if (typeof mware == 'string') {
          mware = this.findRouteMiddleware(mware);
        }
        middlewareHandlers.push(mware);
      }
    }

    middlewareHandlers.push((request: Request, response: Response, next: express.NextFunction) => {

      let controller = Reflect.construct(controllerClass, [request, response]);
      let actionRet = controller[actionName]();
      if (actionRet instanceof Promise) {
        actionRet.catch(err => next(err));
      }
    });

    (this.expressRouter as any)[method.toLowerCase()](this.prefix(path), this.middlewareHandlers.concat(middlewareHandlers));
  }

  /**
   * Apply prefix
   */
  private prefix(path: string) {
    path = `/${_.trim(path, '/')}`;
    if (this.options.prefix) {
      return `/${this.options.prefix}${path}`;
    }
    return path;
  }

  /**
   * Apply namespace
   */
  private namespace(path: string) {
    path = `/${_.trim(path, '/')}`;
    if (this.options.namespace) {
      path = `/${this.options.namespace}${path}`;
    }
    return path;
  }

  /**
   * Set GET route method
   */
  public get(path: string, controller: string, middleware?: string[]) {
    this.route('GET', path, controller, middleware);
  }

  /**
   * Set POST route method
   */
  public post(path: string, controller: string, middleware?: string[]) {
    this.route('POST', path, controller, middleware);
  }

  /**
   * Set PUT route method
   */
  public put(path: string, controller: string, middleware?: string[]) {
    this.route('PUT', path, controller, middleware);
  }

  /**
   * Set DELETE route method
   */
  public delete(path: string, controller: string, middleware?: string[]) {
    this.route('DELETE', path, controller, middleware);
  }

  /**
   * Create route group
   */
  public group(closure: RouteGroupClosure): void;

  /**
   * Create route group
   */
  public group(options: RouteGroupOptions, closure: RouteGroupClosure): void;

  /**
   * Create route group
   */
  public group(options: RouteGroupOptions | RouteGroupClosure, closure?: RouteGroupClosure) {
    if (typeof options == 'function') {
      closure = options;
      options = {};
    }

    if (typeof closure != 'function') return;

    let mergedOptions = _.merge({}, this.options, options);
    if (options.prefix) {
      mergedOptions.prefix = this.prefix(options.prefix);
    }

    if (options.namespace) {
      mergedOptions.namespace = this.namespace(options.namespace);
    }

    let router = new Router(mergedOptions, this.controllersDir, this.middlewareDir);
    for (let handler of this.middlewareHandlers) {
      router.middleware(handler);
    }

    closure(router);
    this.expressRouter.use(router.getExpressRouter());
  }
}
