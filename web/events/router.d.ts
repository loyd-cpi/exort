import { EventListenerClass } from './handler';
import { WebApplication } from '../app';
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
export declare class EventsRouter {
    private readonly app;
    private listenersDir;
    private middlewareDir;
    private namespace;
    /**
     * Event mapping
     */
    private events;
    /**
     * Middleware mapping
     */
    private middlewareMapping;
    /**
     * Flag to determine if routes are already attached via attachRoute() method
     */
    private alreadyAttachedRoutes;
    /**
     * EventsRouter constructor
     */
    constructor(app: WebApplication, listenersDir: string, middlewareDir: string, namespace?: string);
    /**
     * Get listener
     */
    private findListener(listener);
    /**
     * Route an event to an event listener action
     */
    on(eventName: string, listener: string): void;
    /**
     * Attach routes / events to WebApplication instance
     */
    attachRoutes(): void;
    /**
     * Add namespace middleware
     */
    middleware(middleware: string): void;
    /**
     * Create event routes group
     */
    of(namespace: string, closure: EventRouteGroupClosure): void;
}
/**
 * Provide socketio events
 */
export declare function provideEvents(eventRoutesFile?: string, eventListenersDir?: string, eventMiddlewareDir?: string): (app: WebApplication) => Promise<void>;
