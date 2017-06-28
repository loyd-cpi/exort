import * as express from 'express';
/**
 * Install logger middleware
 * @param  {T} app
 * @return {void}
 */
export declare function installLogger<T extends express.Server>(app: T): void;
