import { checkAppConfig, Application, AppProvider } from './app';
import { Response, Request } from './http';
import * as express from 'express';
import { _ } from './misc';

/**
 * Decorator to make an injectable class
 * @return {((target: Function) => void)}
 */
export function Injectable() {
  return (target: Function) => {
    if (typeof target != 'function') {
      throw new Error(`${typeof target} cannot be injectable`);
    }
    (target as any).$injectParamNames = _.getConstructorParamNames(target);
  };
}

/**
 * Check if class is injectable
 * @param  {Function} targetClass
 * @return {boolean}
 */
export function isInjectable(targetClass: Function): boolean {
  if (typeof targetClass != 'function') {
    throw new Error('Invalid target class');
  }
  return Array.isArray((targetClass as any).$injectParamNames);
}

/**
 * Context class
 */
export class Context {

  /**
   * Map of resolved instances
   * @type {Map<string, any>}
   */
  private resolvedInstances: Map<Function, any> = new Map<Function, any>();

  /**
   * Context constructor
   * @param {Application} app
   */
  constructor(public readonly app: Application) {
    this.resolvedInstances.set(Context, this);
  }

  /**
   * create instance via dependency injection and using this context
   * @param  {(new(...args: any[]) => U)} serviceClass
   * @return {U}
   */
  public make<U extends Service>(serviceClass: new(...args: any[]) => U): U {
    if (this.resolvedInstances.has(serviceClass)) {
      return this.resolvedInstances.get(serviceClass);
    }

    if (!isInjectable(serviceClass)) {
      throw new Error(`${serviceClass.name} is not an injectable class`);
    }

    if (!_.classExtends(serviceClass, Service)) {
      throw new Error(`${serviceClass.name} is not a Service class`);
    }

    let params: (Service | Context)[] = [];
    if (Reflect.hasMetadata('design:paramtypes', serviceClass)) {

      let paramTypes: ServiceClass[] = Reflect.getMetadata('design:paramtypes', serviceClass);
      for (let paramIndex in paramTypes) {

        if (_.isNone(paramTypes[paramIndex])) {
          throw new Error(
            `Empty param type for ${(serviceClass as any).$injectParamNames[paramIndex]} in ${serviceClass.name} constructor.
            It might be caused by circular dependency`
          );
        }

        params.push(this.make(paramTypes[paramIndex]));
      }
    }

    if (!params.length) {
      params.push(this);
    }

    let instance = Reflect.construct(serviceClass, params);
    this.resolvedInstances.set(serviceClass, instance);
    return instance;
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
 * @return {AppProvider}
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
   * @param {Context} context
   */
  constructor(protected readonly context: Context) {}
}
