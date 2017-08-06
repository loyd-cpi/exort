/// <reference types="node" />
/// <reference types="socket.io" />
import { Application, AppBootstrap } from '../core/app';
import * as http from 'http';
/**
 * Abstract HttpBootstrap class
 */
export declare abstract class HttpBootstrap extends AppBootstrap {
}
/**
 * WebApplication interface
 */
export interface WebApplication extends Application {
    /**
     * Server instance
     */
    readonly server: http.Server;
    /**
     * SocketIO Server instance
     */
    readonly socketio: SocketIO.Server;
}
