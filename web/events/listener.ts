import { Context } from '../../core/service';
import { Application } from '../../core/app';

/**
 * EventListenerClass interface
 */
export interface EventListenerClass {
  new(context: Context, socket: SocketIO.Socket): EventListener;
}

/**
 * Abstract Channel class
 */
export abstract class EventListener {

  /**
   * Application instance
   */
  protected readonly app: Application;

  /**
   * Channel constructor
   */
  constructor(protected readonly context: Context, protected readonly socket: SocketIO.Socket) {
    this.app = context.app;
  }
}
