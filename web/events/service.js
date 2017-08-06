"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../../core/service");
/**
 * SocketIO service class
 */
class BroadcasterService extends service_1.Service {
    /**
     * BroadcastService constructor
     */
    constructor(context, namespace) {
        super(context);
        this.io = context.app.socketio;
        this.namespace = this.io.of(namespace || '/');
    }
    /**
     * Get an instance of BroadcastService that uses the give namespace
     */
    of(namespace) {
        if (namespace != this.namespace.name) {
            return Reflect.construct(this.constructor, [this.context, namespace]);
        }
        return this;
    }
    /**
     * Emits an event to all connected clients from the room or a particular socket id
     */
    broadcastTo(roomsOrSocketIds, eventName, ...data) {
        if (Array.isArray(roomsOrSocketIds)) {
            for (let receiver of roomsOrSocketIds) {
                this.namespace.to(receiver);
            }
        }
        else {
            this.namespace.to(roomsOrSocketIds);
        }
        this.namespace.emit(eventName, ...data);
    }
    /**
     * Emits an event to all connected clients
     */
    broadcast(eventName, ...data) {
        this.namespace.emit(eventName, ...data);
    }
    /**
     * Get connected clients from current namespace
     */
    getClientIds(fromRoomName) {
        return new Promise((resolve, reject) => {
            (fromRoomName ? this.namespace.in(fromRoomName) : this.namespace).clients((err, clients) => {
                if (err)
                    return reject(err);
                resolve(clients || []);
            });
        });
    }
}
exports.BroadcasterService = BroadcasterService;
//# sourceMappingURL=service.js.map