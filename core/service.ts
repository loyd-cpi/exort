import { checkAppConfig, Application, AppProvider } from './app';
import { __, I18nService, Language } from './i18n';
import { Response, Request } from '../web/http';
import { KeyValuePair, _ } from './misc';
import { Service } from './handler';
import * as express from 'express';
import { Store } from './store';
import { Error } from './error';

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
   * Map of bindings
   */
  private bindings: Map<Function, Function> = new Map<Function, Function>();

  /**
   * Language object
   */
  private language: Language;

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

    this.checkIfServiceClass(serviceClass);

    let instance: U;
    if (this.bindings.has(serviceClass)) {
      instance = (this.bindings.get(serviceClass) as Function)(this);
    } else {
      instance = Reflect.construct(serviceClass, [this]);
    }

    this.remember(serviceClass, instance);
    return instance;
  }

  /**
   * Provide custom way of resolving an instance for a service
   */
  public bind<U extends Service>(serviceClass: new(...args: any[]) => U, closure: (context: Context) => U) {
    this.checkIfServiceClass(serviceClass);
    this.bindings.set(serviceClass, closure);
  }

  /**
   * Remember resolved instance and save it for future make() calls
   */
  public remember<U extends Service>(serviceClass: new(...args: any[]) => U, instance: U) {
    this.checkIfServiceClass(serviceClass);
    this.resolvedInstances.set(serviceClass, instance);
  }

  /**
   * Check if given class extends Service class
   */
  private checkIfServiceClass<U extends Service>(serviceClass: new(...args: any[]) => U) {
    if (!_.classExtends(serviceClass, Service)) {
      throw new Error(`${serviceClass.name} is not a Service class`);
    }
  }

  /**
   * Get default render data
   */
  public addFrameworkRenderData(data: KeyValuePair) {
    data.__ = (key: string, params?: KeyValuePair) => __(this, key, params);
  }

  /**
   * Change the active language at runtime
   */
  public setLocale(locale: Language | string) {
    if (typeof locale == 'string' && locale) {
      this.language = this.make(I18nService).getTranslations(locale);
    } else if (locale instanceof Language) {
      this.language = locale;
    }
  }

  /**
   * Get locale
   */
  public getLocale(): Language {
    if (!this.language) {
      const locale = this.app.config.get('app.locale');
      if (!locale) {
        throw new Error('app.locale config must be set');
      }
      this.setLocale(locale);
    }
    return this.language;
  }

  /**
   * Create new instance with app instance
   */
  public newInstance(): Context {
    const context = Reflect.construct(this.constructor, [this.app]);
    if (this.language) {
      context.setLocale(this.language);
    }
    return context;
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
