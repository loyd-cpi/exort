"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Subscriber class
 */
class Subscriber {
    /**
     * Subscriber constructor
     */
    constructor(socket, namespace) {
        this.socket = socket;
        this.namespace = namespace;
        /**
         * Listener instance cache
         */
        this.listenerInstances = new Map();
        this.context = socket.context;
    }
    /**
     * Fire an event listener
     */
    fireListener(eventListenerClass, methodName, args = []) {
        const instance = this.createListenerInstance(eventListenerClass);
        const ret = instance[methodName].apply(instance, args);
        if (ret instanceof Promise) {
            ret.catch(err => console.error(err));
        }
    }
    /**
     * Subscribe or listen to an event
     */
    subscribe(event) {
        if (event.name == 'connection') {
            this.fireListener(event.listener.class, event.listener.method);
            return;
        }
        this.socket.on(event.name, (...args) => this.fireListener(event.listener.class, event.listener.method, args));
    }
    /**
     * Unsubscribe to an event
     */
    unsubscribe(eventName) {
        this.socket.removeAllListeners(eventName);
    }
    /**
     * Create or fetch instance from cache
     */
    createListenerInstance(eventListenerClass) {
        if (!this.listenerInstances.has(eventListenerClass)) {
            this.listenerInstances.set(eventListenerClass, new eventListenerClass(this.socket));
        }
        return this.listenerInstances.get(eventListenerClass);
    }
    /**
     * Disconnects this client to its current namespace
     */
    disconnect() {
        this.socket.disconnect(false);
    }
    /**
     * * Execute disconnect method and closes the underlying connection
     */
    close() {
        this.socket.disconnect(true);
    }
}
exports.Subscriber = Subscriber;
//# sourceMappingURL=subscriber.js.map