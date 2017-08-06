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
}
/**
 * Subscriber class
 */
export declare class Subscriber {
    readonly socket: Socket;
    readonly namespace: Namespace;
    /**
     * Context instance
     */
    private readonly context;
    /**
     * Listener instance cache
     */
    private readonly listenerInstances;
    /**
     * Subscriber constructor
     */
    constructor(socket: Socket, namespace: Namespace);
    /**
     * Fire an event listener
     */
    private fireListener(eventListenerClass, methodName, args?);
    /**
     * Subscribe or listen to an event
     */
    subscribe(event: Event): void;
    /**
     * Unsubscribe to an event
     */
    unsubscribe(eventName: string): void;
    /**
     * Create or fetch instance from cache
     */
    private createListenerInstance(eventListenerClass);
    /**
     * Disconnects this client to its current namespace
     */
    disconnect(): void;
    /**
     * * Execute disconnect method and closes the underlying connection
     */
    close(): void;
}
