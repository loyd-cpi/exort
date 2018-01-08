import { ContextHandler, ErrorHandler } from '../core/handler';
import { BroadcasterService } from './events/service';
import { Input, Request, Response } from './http';
import { KeyValuePair } from '../core/misc';
import { WebApplication } from './app';
import { Bind } from '../core/service';
import { Error } from '../core/error';
import { Session } from './session';
import * as express from 'express';

/**
 * HttpRequestParams interface
 */
export interface HttpRequestParams {
  [param: string]: string;
  [captureGroup: number]: string;
}

/**
 * Abstract HttpHandler class
 */
export abstract class HttpHandler extends ContextHandler {

  /**
   * Application instance
   */
  protected readonly app: WebApplication;

  /**
   * Request input instance
   */
  protected readonly input: Input;

  /**
   * Express response locals object
   */
  protected readonly vars: KeyValuePair;

  /**
   * Express request params object
   */
  protected readonly params: HttpRequestParams;

  /**
   * Express session instance
   */
  protected readonly session: Session;

  /**
   * BroadcasterService instance
   */
  @Bind(type => BroadcasterService)
  protected readonly broadcaster: BroadcasterService;

  /**
   * HttpHandler constructor
   */
  constructor(protected readonly request: Request, protected readonly response: Response) {
    super(request.context);
    this.app = request.context.app as WebApplication;
    this.input = request.input;
    this.vars = response.locals;
    this.params = request.params;
    this.session = request.session;
  }

  /**
   * Render and send view
   */
  protected renderView(name: string, options?: KeyValuePair): void {
    options = options || {};
    this.addFrameworkRenderData(options);
    this.response.render(name, options);
  }
}

/**
 * HttpMiddleware class
 */
export abstract class HttpMiddleware extends HttpHandler {

  /**
   * Abstract handle method
   */
  public abstract async handle(next: express.NextFunction): Promise<void>;
}

/**
 * Abstract HttpController class
 */
export abstract class HttpController extends HttpHandler {}

/**
 * Abstract HttpErrorHandler class
 */
export abstract class HttpErrorHandler extends ErrorHandler {

  /**
   * Report error
   */
  public async report(error: Error): Promise<void> {

  }

  /**
   * Abstract render method
   */
  public abstract async render(error: Error, request: Request, response: Response): Promise<void>;
}
