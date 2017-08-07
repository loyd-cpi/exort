"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const handler_1 = require("./handler");
const misc_1 = require("../../core/misc");
const subscriber_1 = require("./subscriber");
const app_1 = require("../../core/app");
const redisAdapter = require("socket.io-redis");
const error_1 = require("../../core/error");
const socketio = require("socket.io");
const redis = require("redis");
/**
 * EventsRouter class
 */
class EventsRouter {
    /**
     * EventsRouter constructor
     */
    constructor(app, listenersDir, middlewareDir, namespace = '/') {
        this.app = app;
        this.listenersDir = listenersDir;
        this.middlewareDir = middlewareDir;
        this.namespace = namespace;
        /**
         * Event and middleware mapping
         */
        this.namespaceMapping = {};
        /**
         * Flag to determine if routes are already attached via attachRoute() method
         */
        this.alreadyAttachedRoutes = false;
        if (typeof this.app.socketio == 'undefined') {
            throw new error_1.Error('app.socketio must be set first passing to EventsRouter constructor');
        }
    }
    /**
     * Get listener
     */
    findListener(listener) {
        const [listenerClassName, actionName] = listener.split('@');
        const ListenerClass = misc_1._.requireClass(`${this.listenersDir}/${listenerClassName}`);
        if (!misc_1._.classExtends(ListenerClass, handler_1.EventListener)) {
            throw new error_1.Error(`${ListenerClass.name} must extends EventListener class`);
        }
        if (typeof ListenerClass.prototype[actionName] != 'function') {
            throw new error_1.Error(`${ListenerClass.name} doesn't have '${actionName}' method`);
        }
        return { class: ListenerClass, method: actionName };
    }
    /**
     * Route an event to an event listener action
     */
    on(eventName, listener) {
        this.initNamespace();
        this.namespaceMapping[this.namespace].events.push({ name: eventName, listener: this.findListener(listener) });
    }
    /**
     * Initialize namespace map
     */
    initNamespace() {
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
    attachRoutes() {
        if (this.alreadyAttachedRoutes) {
            throw new error_1.Error('Already attached routes');
        }
        Object.keys(this.namespaceMapping).forEach(namespace => {
            const namespaceInstance = this.app.socketio.of(namespace);
            namespaceInstance.use((socket, next) => {
                if (typeof socket.context != 'undefined') {
                    throw new error_1.Error('socket.context is already set. There might be conflict with socket.io');
                }
                socket.context = this.app.context.newInstance();
            });
            (this.namespaceMapping[namespace].middleware).forEach(mware => namespaceInstance.use(mware));
            namespaceInstance.on('connection', (socket) => {
                const subscriber = new subscriber_1.Subscriber(socket, namespaceInstance);
                this.namespaceMapping[namespace].events.forEach(event => subscriber.subscribe(event));
            });
        });
        this.alreadyAttachedRoutes = true;
    }
    /**
     * Add namespace middleware
     */
    middleware(middleware) {
        this.initNamespace();
        const MiddlewareClass = misc_1._.requireClass(`${this.middlewareDir}/${middleware}`);
        if (!misc_1._.classExtends(MiddlewareClass, handler_1.EventMiddleware)) {
            throw new error_1.Error(`${MiddlewareClass.name} must extends EventMiddleware class`);
        }
        this.namespaceMapping[this.namespace].middleware.push((socket, next) => {
            const instance = Reflect.construct(MiddlewareClass, [socket]);
            const ret = instance.handle(next);
            if (ret instanceof Promise) {
                ret.catch(err => next(err));
            }
        });
    }
    /**
     * Create event routes group
     */
    of(namespace, closure) {
        const prevNamespace = this.namespace;
        this.namespace = `/${misc_1._.trim(namespace, '/')}`;
        closure(this);
        this.namespace = prevNamespace;
    }
}
exports.EventsRouter = EventsRouter;
/**
 * Provide socketio events
 */
function provideEvents(eventRoutesFile, eventListenersDir, eventMiddlewareDir) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        const config = app.config.get('socketio');
        if (!config)
            return;
        if (!eventRoutesFile) {
            eventRoutesFile = `${app.dir}/events/routes`;
        }
        if (eventListenersDir) {
            eventListenersDir = misc_1._.trimEnd(eventListenersDir, '/');
        }
        else {
            eventListenersDir = `${app.dir}/events/listeners`;
        }
        if (eventMiddlewareDir) {
            eventMiddlewareDir = misc_1._.trimEnd(eventMiddlewareDir, '/');
        }
        else {
            eventMiddlewareDir = `${app.dir}/events/middleware`;
        }
        if (typeof app.socketio != 'undefined') {
            throw new error_1.Error('app.socketio already exists. There might be conflict with express');
        }
        let adapter;
        const socketioConf = misc_1._.cloneDeep(config);
        if (!misc_1._.isNone(socketioConf.adapter)) {
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
        const io = app.socketio = socketio(app.server, socketioConf);
        if (adapter) {
            io.adapter(adapter);
        }
        const routes = require(eventRoutesFile);
        if (!misc_1._.isNone(routes) && typeof routes == 'object' && typeof routes.setup == 'function') {
            const router = new EventsRouter(app, eventListenersDir, eventMiddlewareDir, '/');
            routes.setup(router, app);
            router.attachRoutes();
        }
    });
}
exports.provideEvents = provideEvents;
//# sourceMappingURL=router.js.map