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
   * Event and middleware mapping
   */
  private namespaceMapping: KeyValuePair<{
    events: Event[],
    middleware: ((socket: Socket, next: EventNextFunction) => void)[]
  }> = {};

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
    this.initNamespace();
    this.namespaceMapping[this.namespace].events.push({ name: eventName, listener: this.findListener(listener) });
  }

  /**
   * Initialize namespace map
   */
  private initNamespace() {
    if (typeof this.namespaceMapping[this.namespace] == 'undefined') {
      this.namespaceMapping[this.namespace] = {
        events: [],
        middleware: []
      };
    }
  }

  /**
   * Attach routes / events to WebApplication instance
   */
  public attachRoutes() {
    if (this.alreadyAttachedRoutes) {
      throw new Error('Already attached routes');
    }

    Object.keys(this.namespaceMapping).forEach(namespace => {

      const namespaceInstance = this.app.socketio.of(namespace);
      namespaceInstance.use((socket: Socket, next: EventNextFunction) => {

        if (typeof socket.context != 'undefined') {
          next(new Error('socket.context is already set. There might be conflict with socket.io'));
          return;
        }

        (socket as any).context = this.app.context.newInstance();
        next();
      });

      (this.namespaceMapping[namespace].middleware).forEach(mware => namespaceInstance.use(mware));

      namespaceInstance.on('connection', (socket: Socket) => {
        const subscriber = new Subscriber(socket, namespaceInstance);
        this.namespaceMapping[namespace].events.forEach(event => subscriber.subscribe(event));
      });
    });

    this.alreadyAttachedRoutes = true;
  }

  /**
   * Add namespace middleware
   */
  public middleware(middleware: string) {
    this.initNamespace();

    const MiddlewareClass = _.requireClass(`${this.middlewareDir}/${middleware}`) as EventMiddlewareClass;
    if (!_.classExtends(MiddlewareClass, EventMiddleware)) {
      throw new Error(`${MiddlewareClass.name} must extends EventMiddleware class`);
    }

    this.namespaceMapping[this.namespace].middleware.push((socket: Socket, next: EventNextFunction) => {

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

    let adapter: SocketIORedis.RedisAdapter | undefined;
    const socketioConf = _.cloneDeep(config);
    if (!_.isNone(socketioConf.adapter)) {

      if (typeof socketioConf.adapter == 'object') {

        if ('password' in socketioConf.adapter && !socketioConf.adapter.password) {
          delete socketioConf.adapter.password;
        }

        adapter = redisAdapter({
          pubClient: redis.createClient(socketioConf.adapter),
          subClient: redis.createClient(socketioConf.adapter)
        });
      }

      delete socketioConf.adapter;
    }

    if (Array.isArray(socketioConf.origins) && !socketioConf.origins.length) {
      delete socketioConf.origins;
    }

    if (Array.isArray(socketioConf.transports) && socketioConf.transports.indexOf('polling') == -1) {
      socketioConf.transports.unshift('polling');
    }

    const io = (app as any).socketio = socketio(app.server, socketioConf);
    if (adapter) {
      io.adapter(adapter);
    }

    const routes = require(eventRoutesFile);
    if (!_.isNone(routes) && typeof routes == 'object' && typeof routes.setup == 'function') {

      const router = new EventsRouter(app, eventListenersDir, eventMiddlewareDir, '/');
      routes.setup(router, app);
      router.attachRoutes();
    }
  };
}
