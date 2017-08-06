import { Service, Context } from '../../core/service';
import { WebApplication } from '../app';

/**
 * SocketIO service class
 */
export class BroadcasterService extends Service {

  /**
   * SocketIO namespace name
   */
  public readonly namespace: SocketIO.Namespace;

  /**
   * SocketIO Server instance
   */
  public readonly io: SocketIO.Server;

  /**
   * BroadcastService constructor
   */
  constructor(context: Context, namespace?: string) {
    super(context);
    this.io = (context.app as WebApplication).socketio;
    this.namespace = this.io.of(namespace || '/');
  }

  /**
   * Get an instance of BroadcastService that uses the give namespace
   */
  public of(namespace: string): BroadcasterService {
    if (namespace != this.namespace.name) {
      return Reflect.construct(this.constructor, [this.context, namespace]);
    }
    return this;
  }

  /**
   * Emits an event to all connected clients from the room or a particular socket id
   */
  public broadcastTo(roomOrSocketId: string, eventName: string, ...data: any[]): void;

  /**
   * Emits an event to all connected clients from the room or a particular socket id
   */
  public broadcastTo(roomsOrSocketIds: string[], eventName: string, ...data: any[]): void;

  /**
   * Emits an event to all connected clients from the room or a particular socket id
   */
  public broadcastTo(roomsOrSocketIds: string | string[], eventName: string, ...data: any[]): void {
    if (Array.isArray(roomsOrSocketIds)) {
      for (let receiver of roomsOrSocketIds) {
        this.namespace.to(receiver);
      }
    } else {
      this.namespace.to(roomsOrSocketIds);
    }
    this.namespace.emit(eventName, ...data);
  }

  /**
   * Emits an event to all connected clients
   */
  public broadcast(eventName: string, ...data: any[]) {
    this.namespace.emit(eventName, ...data);
  }

  /**
   * Get connected clients from current namespace
   */
  public getClientIds(): Promise<string[]>;

  /**
   * Get connected clients from current namespace
   */
  public getClientIds(fromRoomName: string): Promise<string[]>;

  /**
   * Get connected clients from current namespace
   */
  public getClientIds(fromRoomName?: string) {
    return new Promise<string[]>((resolve, reject) => {
      (fromRoomName ? this.namespace.in(fromRoomName) : this.namespace).clients((err: Error, clients: string[]) => {

        if (err) return reject(err);
        resolve(clients);
      });
    });
  }
}
