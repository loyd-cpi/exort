import { _, KeyValuePair } from '../../core/misc';
import { checkAppConfig } from '../../core/app';
import { EventListenerClass } from './listener';
import * as redisAdapter from 'socket.io-redis';
import { Subscriber } from './subscriber';
import { Error } from '../../core/error';
import { WebApplication } from '../app';
import * as socketio from 'socket.io';
import * as redis from 'redis';

/**
 * RouteGroupOptions interface
 */
export interface EventRouteGroupOptions {
  channel: string;
}

/**
 * RouteGroupClosure interface
 */
export interface EventRouteGroupClosure {
  (router: EventsRouter): void;
}

/**
 * EventsRegistry interface
 */
export interface Event {
  name: string;
  listener: {
    class: EventListenerClass;
    method: string;
  };
}

/**
 * EventsRouter class
 */
export class EventsRouter {

  /**
   * Events interface
   */
  private events: KeyValuePair<Event[]> = {};

  /**
   * EventsRouter constructor
   */
  constructor(private listenersDir: string, private namespace: string = '/') {}

  /**
   * Get listener
   */
  private findListener(listener: string) {
    const [listenerClassName, actionName] = listener.split('@');
    const ListenerClass = _.requireClass(`${this.listenersDir}/${listenerClassName}`);
    if (typeof ListenerClass.prototype[actionName] != 'function') {
      throw new Error(`${ListenerClass.name} doesn't have '${actionName}' method`);
    }
    return { class: ListenerClass as EventListenerClass, method: actionName };
  }

  /**
   * Route an event to an event listener action
   */
  public on(eventName: string, listener: string) {
    if (typeof this.events[this.namespace] == 'undefined') {
      this.events[this.namespace] = [];
    }
    this.events[this.namespace].push({ name: eventName, listener: this.findListener(listener) });
  }

  /**
   * Attach routes / events to WebApplication instance
   */
  public attachRoutes(app: WebApplication) {
    if (typeof app.socketio == 'undefined') {
      throw new Error('app.socketio must be set first before using EventsRouter.attachRoute');
    }

    Object.keys(this.events).forEach(namespace => {
      app.socketio.of(namespace).on('connection', socket => {

        const subscriber = new Subscriber(app, socket, namespace);
        this.events[namespace].forEach(event => subscriber.subscribe(event));
      });
    });
  }

  /**
   * Create event routes group
   */
  public of(namespace: string, closure: EventRouteGroupClosure): void {
    const prevNamespace = this.namespace;
    this.namespace = `/${_.trim(namespace, '/')}`;
    closure(this);
    this.namespace = prevNamespace;
  }
}

/**
 * Provide socketio events
 */
export function provideEvents(eventRoutesFile?: string, eventListenersDir?: string) {
  return async (app: WebApplication): Promise<void> => {
    checkAppConfig(app);

    const config = app.config.get('socketio');
    if (!config) return;

    if (!eventRoutesFile) {
      eventRoutesFile = `${app.dir}/events/routes`;
    }

    if (eventListenersDir) {
      eventListenersDir = _.trimEnd(eventListenersDir, '/');
    } else {
      eventListenersDir = `${app.dir}/events/listeners`;
    }

    if (typeof app.socketio != 'undefined') {
      throw new Error('app.socketio already exists. There might be conflict with express');
    }

    const socketioConf = _.clone(config);
    socketioConf.adapter = redisAdapter({ pubClient: redis.createClient(config.adapter), subClient: redis.createClient(config.adapter) });
    (app as any).socketio = socketio(app.server, socketioConf);

    const routes = require(eventRoutesFile);
    if (!_.isNone(routes) && typeof routes == 'object' && typeof routes.setup == 'function') {

      const router = new EventsRouter(eventListenersDir, '/');
      routes.setup(router, app);
      router.attachRoutes(app);
    }
  };
}
