import { getConnectionManager, Connection } from 'typeorm';
import { checkAppConfig, BaseApplication } from './app';
import { Response } from './response';
import { Request } from './request';
import * as express from 'express';
import { _ } from './misc';

/**
 * ServiceContext class
 */
export class ServiceContext {

  /**
   * Map of resolved instances
   * @type {Map<string, any>}
   */
  private resolvedInstances: Map<Function, any> = new Map<Function, any>();

  /**
   * create instance via dependency injection and using this context
   * @param  {(new(...args: any[]) => U)} serviceClass
   * @return {U}
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
}

/**
 * ServiceClassResolver interface
 */
export interface ServiceClassResolver<U extends Service> {
  (type?: any): new(...args: any[]) => U;
}

/**
 * Decorator for injecting service dependencies
 * @param  {ServiceClassResolver} resolver
 * @return {((target: Object, propertyKey: string) => void)}
 */
export function Inject<U extends Service>
  (resolver: ServiceClassResolver<U>): ((target: Object, propertyKey: string) => void) {
  return (target: Object, propertyKey: string) => {

    Object.defineProperty(target, propertyKey, {
      get() {
        return (this as any).context.make(resolver());
      }
    });
  };
}

/**
 * Install services
 * @param  {T} app
 * @return {void}
 */
export function installServices<T extends BaseApplication>(app: T): void {
  checkAppConfig(app);
  app.use((req: Request, res: Response, next: express.NextFunction) => {
    if (!(req.serviceContext instanceof ServiceContext) || typeof req.make != 'function') {
      req.serviceContext = new ServiceContext();
      req.make = req.serviceContext.make.bind(req.serviceContext);
    }
    next();
  });
}

/**
 * Abstract Service class
 */
export abstract class Service {

  /**
   * Service constructor
   * @param {ServiceContext} context
   */
  constructor(protected context: ServiceContext) {}
}

/**
 * Abstract SQLService class
 */
export abstract class SQLService extends Service {

  /**
   * Gets registered connection with the given name.
   * If connection name is not given then it will get a default connection.
   * Throws exception if connection with the given name was not found.
   * @param  {string} name
   * @return {Connection}
   */
  public connection(name: string = 'default'): Connection {
    return getConnectionManager().get(name);
  }
}
