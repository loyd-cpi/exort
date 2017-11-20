import { EventListener, EventListenerClass } from './handler';
import { KeyValuePair } from '../../core/misc';
import { Context } from '../../core/service';
import { Namespace } from './service';
import { Event } from './router';

/**
 * Socket interface
 */
export interface Socket extends SocketIO.Socket {

  /**
   * Context instance
   */
  readonly context: Context;

  /**
   * Socket custom data
   */
  readonly data: KeyValuePair<any>;
}

/**
 * Subscriber class
 */
export class Subscriber {

  /**
   * Listener instance cache
   */
  private readonly listenerInstances = new Map<EventListenerClass, EventListener>();

  /**
   * Subscriber constructor
   */
  constructor(public readonly socket: Socket, public readonly namespace: Namespace) {}

  /**
   * Fire an event listener
   */
  private fireListener(eventListenerClass: EventListenerClass, methodName: string, args: any[] = []) {
    const instance = this.createListenerInstance(eventListenerClass);
    const ret = (instance as any)[methodName].apply(instance, args);
    if (ret instanceof Promise) {
      ret.catch(err => console.error(err));
    }
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
      this.listenerInstances.set(eventListenerClass, new eventListenerClass(this.socket));
    }
    return this.listenerInstances.get(eventListenerClass);
  }

  /**
   * Disconnects this client to its current namespace
   */
  public disconnect() {
    this.socket.disconnect(false);
  }

  /**
   * * Execute disconnect method and closes the underlying connection
   */
  public close() {
    this.socket.disconnect(true);
  }
}
