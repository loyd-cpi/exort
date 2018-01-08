import { KeyValuePair } from './misc';
import { Context } from './service';
import { Application } from './app';
import { __ } from './i18n';

/**
 * ContextHandler class
 * Must be the parent class of all class that contains context property
 */
export abstract class ContextHandler {

  /**
   * ContextHandler constructor
   */
  constructor(protected readonly context: Context) {}

  /**
   * Get context
   */
  public getContext() {
    return this.context;
  }

  /**
   * Get default render data
   */
  protected addFrameworkRenderData(data: KeyValuePair) {
    data.__ = (key: string, params?: KeyValuePair) => __(this, key, params);
  }

  /**
   * Render template without sending and returns as string
   */
  protected compileView(name: string, options?: KeyValuePair, callback?: (err: Error, html: string) => void): Promise<string> | void {
    if (typeof options == 'object' && options) {
      this.addFrameworkRenderData(options);
    }
    return this.context.app.render(name, options as any, callback as any);
  }
}

/**
 * Base ErrorHandler class
 */
export abstract class ErrorHandler extends ContextHandler {

  /**
   * ErrorHandler constructor
   */
  constructor(protected readonly app: Application, context: Context) {
    super(context);
  }

  /**
   * Abstract report method
   */
  public abstract async report(error: Error): Promise<void>;
}

/**
 * Abstract Service class
 */
export abstract class Service extends ContextHandler {

  /**
   * Application instance
   */
  protected readonly app: Application;

  /**
   * Service constructor
   */
  constructor(context: Context) {
    super(context);
    this.app = context.app;
  }

  /**
   * Create instance of given Service class. Just like what req.make() does
   */
  protected make<U extends Service>(serviceClass: new(...args: any[]) => U): U {
    return this.context.make(serviceClass);
  }
}
