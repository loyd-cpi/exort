/// <reference types="socket.io" />
import { Service, Context } from '../../core/service';
/**
 * Namespace interface
 */
export interface Namespace extends SocketIO.Namespace {
}
/**
 * SocketIO service class
 */
export declare class BroadcasterService extends Service {
    /**
     * SocketIO namespace name
     */
    readonly namespace: Namespace;
    /**
     * SocketIO Server instance
     */
    readonly io: SocketIO.Server;
    /**
     * BroadcastService constructor
     */
    constructor(context: Context, namespace?: string);
    /**
     * Get an instance of BroadcastService that uses the give namespace
     */
    of(namespace: string): BroadcasterService;
    /**
     * Emits an event to all connected clients from the room or a particular socket id
     */
    broadcastTo(roomOrSocketId: string, eventName: string, ...data: any[]): void;
    /**
     * Emits an event to all connected clients from the room or a particular socket id
     */
    broadcastTo(roomsOrSocketIds: string[], eventName: string, ...data: any[]): void;
    /**
     * Emits an event to all connected clients
     */
    broadcast(eventName: string, ...data: any[]): void;
    /**
     * Get connected clients from current namespace
     */
    getClientIds(): Promise<string[]>;
    /**
     * Get connected clients from current namespace
     */
    getClientIds(fromRoomName: string): Promise<string[]>;
}
