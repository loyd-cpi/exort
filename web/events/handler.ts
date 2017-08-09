import { Context, Bind } from '../../core/service';
import { BroadcasterService } from './service';
import { WebApplication } from '../app';
import { Socket } from './subscriber';

/**
 * EventNextFunction interface
 */
export interface EventNextFunction {
  (err?: Error): void;
}

/**
 * Abstract EventHandler class
 */
export abstract class EventHandler {

  /**
   * BroadcasterService instance
   */
  @Bind(type => BroadcasterService)
  protected readonly broadcaster: BroadcasterService;

  /**
   * WebApplication instance
   */
  protected readonly app: WebApplication;

  /**
   * Context instance
   */
  protected readonly context: Context;

  /**
   * EventHandler constructor
   */
  constructor(protected readonly socket: Socket) {
    this.context = socket.context;
    this.app = socket.context.app as WebApplication;
  }
}

/**
 * EventListenerClass interface
 */
export interface EventListenerClass {
  new(socket: Socket): EventListener;
}

/**
 * Abstract EventListener class
 */
export abstract class EventListener extends EventHandler {}

/**
 * EventMiddlewareClass interface
 */
export interface EventMiddlewareClass {
  new(socket: Socket): EventMiddlewareClass;
}

/**
 * Abstract EventMiddleware class
 */
export abstract class EventMiddleware extends EventHandler {

  /**
   * Abstract handle method
   */
  public abstract async handle(next: EventNextFunction): Promise<void>;
}
