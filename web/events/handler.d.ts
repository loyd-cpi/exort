import { Context } from '../../core/service';
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
export declare abstract class EventHandler {
    protected readonly socket: Socket;
    /**
     * BroadcasterService instance
     */
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
    constructor(socket: Socket);
}
/**
 * EventListenerClass interface
 */
export interface EventListenerClass {
    new (socket: Socket): EventListener;
}
/**
 * Abstract EventListener class
 */
export declare abstract class EventListener extends EventHandler {
}
/**
 * EventMiddlewareClass interface
 */
export interface EventMiddlewareClass {
    new (socket: Socket): EventMiddlewareClass;
}
/**
 * Abstract EventMiddleware class
 */
export declare abstract class EventMiddleware extends EventHandler {
    /**
     * Abstract handle method
     */
    abstract handle(next: EventNextFunction): Promise<void>;
}
