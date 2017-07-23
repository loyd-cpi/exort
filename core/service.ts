import { checkAppConfig, Application, AppProvider } from './app';
import { Response, Request } from '../web/http';
import * as express from 'express';
import { _, Store } from './misc';

/**
 * BindOptions interface
 */
export interface BindOptions {}

/**
 * Bind a resolve function to solve circular dependency
 */
export function Bind(resolver: ServiceClassResolver, options?: BindOptions) {
  return (target: Object, propertyKey: string) => {

    let serviceClass: typeof Service;
    Object.defineProperty(target, propertyKey, {
      get(this: Service) {

        if (!serviceClass) {
          serviceClass = resolver();
        }
        return (this as any).context.make(serviceClass);
      }
    });
  };
}

/**
 * Context class
 */
export class Context {

  /**
   * Store instance
   */
  public readonly store: Store = new Store();

  /**
   * Map of resolved instances
   */
  private resolvedInstances: Map<Function, any> = new Map<Function, any>();

  /**
   * Context constructor
   */
  constructor(public readonly app: Application) {}

  /**
   * Create service instance
   */
  public make<U extends Service>(serviceClass: new(...args: any[]) => U): U {
    if (this.resolvedInstances.has(serviceClass)) {
      return this.resolvedInstances.get(serviceClass);
    }

    if (!_.classExtends(serviceClass, Service)) {
      throw new Error(`${serviceClass.name} is not a Service class`);
    }

    let instance = Reflect.construct(serviceClass, [this]);
    this.resolvedInstances.set(serviceClass, instance);
    return instance;
  }

  /**
   * Create new instance with app instance
   */
  public newInstance(): Context {
    return Reflect.construct(this.constructor, [this.app]);
  }
}

/**
 * ServiceClass interface
 */
export interface ServiceClass {
  new(...args: any[]): Service;
}

/**
 * ServiceClassResolver interface
 */
export interface ServiceClassResolver {
  (type?: any): ServiceClass;
}

/**
 * Provider service context
 */
export function provideServices(): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    (app as any).context = new Context(app);
    app.use((req: Request, res: Response, next: express.NextFunction) => {

      if (!(req.context instanceof Context) || typeof req.make != 'function') {
        (req as any).context = new Context(app);
        req.make = req.context.make.bind(req.context);
      }

      next();
    });
  };
}

/**
 * Abstract Service class
 */
export abstract class Service {

  /**
   * Service constructor
   */
  constructor(protected readonly context: Context) {}

  /**
   * Create instance of given Service class. Just like what req.make() does
   */
  protected make<U extends Service>(serviceClass: new(...args: any[]) => U): U {
    return this.context.make(serviceClass);
  }
}

/**
 * ServiceError class
 */
export class ServiceError extends Error {

  /**
   * ServiceError constructor
   */
  constructor(message: string) {
    super(message);
  }
}
