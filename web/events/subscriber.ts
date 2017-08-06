import { EventListener, EventListenerClass } from './listener';
import { Context } from '../../core/service';
import { WebApplication } from '../app';
import { Event } from './router';

/**
 * Subscriber class
 */
export class Subscriber {

  /**
   * Context instance
   */
  private readonly context: Context;

  /**
   * Listener instance cache
   */
  private readonly listenerInstances = new Map<EventListenerClass, EventListener>();

  /**
   * Subscriber constructor
   */
  constructor(private readonly app: WebApplication, public readonly socket: SocketIO.Socket, public readonly namespace: string) {
    this.context = this.app.context.newInstance();
  }

  /**
   * Fire an event listener
   */
  private fireListener(eventListenerClass: EventListenerClass, methodName: string, args: any[] = []) {
    const instance = this.createListenerInstance(eventListenerClass);
    (instance as any)[methodName].apply(instance, args);
  }

  /**
   * Subscribe or listen to an event
   */
  public subscribe(event: Event) {
    if (event.name == 'connection') {
      this.fireListener(event.listener.class, event.listener.method);
      return;
    }
    this.socket.on(event.name, (...args: any[]) => this.fireListener(event.listener.class, event.listener.method, args));
  }

  /**
   * Unsubscribe to an event
   */
  public unsubscribe(eventName: string) {
    this.socket.removeAllListeners(eventName);
  }

  /**
   * Create or fetch instance from cache
   */
  private createListenerInstance(eventListenerClass: EventListenerClass) {
    if (!this.listenerInstances.has(eventListenerClass)) {
      this.listenerInstances.set(eventListenerClass, new eventListenerClass(this.context, this.socket));
    }
    return this.listenerInstances.get(eventListenerClass);
  }
}
