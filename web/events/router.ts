import { EventMiddlewareClass, EventListener, EventMiddleware, EventListenerClass, EventNextFunction } from './handler';
import { _, KeyValuePair } from '../../core/misc';
import { Subscriber, Socket } from './subscriber';
import { checkAppConfig } from '../../core/app';
import * as redisAdapter from 'socket.io-redis';
import { Error } from '../../core/error';
import { WebApplication } from '../app';
import * as socketio from 'socket.io';
import * as redis from 'redis';

/**
 * EventRouteGroupClosure interface
 */
export interface EventRouteGroupClosure {
  (router: EventsRouter): void;
}

/**
 * Event interface
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
   * Event mapping
   */
  private events: KeyValuePair<Event[]> = {};

  /**
   * Middleware mapping
   */
  private middlewareMapping: KeyValuePair<((socket: Socket, next: EventNextFunction) => void)[]> = {};

  /**
   * Flag to determine if routes are already attached via attachRoute() method
   */
  private alreadyAttachedRoutes: boolean = false;

  /**
   * EventsRouter constructor
   */
  constructor(private readonly app: WebApplication, private listenersDir: string, private middlewareDir: string, private namespace: string = '/') {
    if (typeof this.app.socketio == 'undefined') {
      throw new Error('app.socketio must be set first passing to EventsRouter constructor');
    }
  }

  /**
   * Get listener
   */
  private findListener(listener: string) {
    const [listenerClassName, actionName] = listener.split('@');
    const ListenerClass = _.requireClass(`${this.listenersDir}/${listenerClassName}`);
    if (!_.classExtends(ListenerClass, EventListener)) {
      throw new Error(`${ListenerClass.name} must extends EventListener class`);
    }

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
  public attachRoutes() {
    if (this.alreadyAttachedRoutes) {
      throw new Error('Already attached routes');
    }

    Object.keys(this.events).forEach(namespace => {

      const namespaceInstance = this.app.socketio.of(namespace);
      namespaceInstance.use((socket: Socket, next: EventNextFunction) => {
        if (typeof socket.context != 'undefined') {
          throw new Error('socket.context is already set. There might be conflict with socket.io');
        }
        (socket as any).context = this.app.context.newInstance();
      });

      (this.middlewareMapping[namespace] || []).forEach(mware => namespaceInstance.use(mware));

      namespaceInstance.on('connection', (socket: Socket) => {

        const subscriber = new Subscriber(socket, namespaceInstance);
        this.events[namespace].forEach(event => subscriber.subscribe(event));
      });
    });

    this.alreadyAttachedRoutes = true;
  }

  /**
   * Add namespace middleware
   */
  public middleware(middleware: string) {
    if (typeof this.middlewareMapping[this.namespace] == 'undefined') {
      this.middlewareMapping[this.namespace] = [];
    }

    const MiddlewareClass = _.requireClass(`${this.middlewareDir}/${middleware}`) as EventMiddlewareClass;
    if (!_.classExtends(MiddlewareClass, EventMiddleware)) {
      throw new Error(`${MiddlewareClass.name} must extends EventMiddleware class`);
    }

    this.middlewareMapping[this.namespace].push((socket: Socket, next: EventNextFunction) => {

      const instance = Reflect.construct(MiddlewareClass, [socket]) as EventMiddleware;
      const ret = instance.handle(next);
      if (ret instanceof Promise) {
        ret.catch(err => next(err));
      }
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
export function provideEvents(eventRoutesFile?: string, eventListenersDir?: string, eventMiddlewareDir?: string) {
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

    if (eventMiddlewareDir) {
      eventMiddlewareDir = _.trimEnd(eventMiddlewareDir, '/');
    } else {
      eventMiddlewareDir = `${app.dir}/events/middleware`;
    }

    if (typeof app.socketio != 'undefined') {
      throw new Error('app.socketio already exists. There might be conflict with express');
    }

    const socketioConf = _.clone(config);
    socketioConf.adapter = redisAdapter({
      pubClient: redis.createClient(config.adapter),
      subClient: redis.createClient(config.adapter)
    });

    (app as any).socketio = socketio(app.server, socketioConf);

    const routes = require(eventRoutesFile);
    if (!_.isNone(routes) && typeof routes == 'object' && typeof routes.setup == 'function') {

      const router = new EventsRouter(app, eventListenersDir, eventMiddlewareDir, '/');
      routes.setup(router, app);
      router.attachRoutes();
    }
  };
}
