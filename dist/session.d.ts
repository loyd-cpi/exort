import * as express from 'express';
/**
 * Session class
 */
export declare class Session implements Express.Session {
    private express;
    /**
     * Flash key
     * @type {string}
     */
    private static FLASH_KEY;
    /**
     * Userdata key
     * @type {string}
     */
    private static USERDATA_KEY;
    /**
     * Session constructor
     * @param {Express.Session} private express
     */
    constructor(express: Express.Session);
    /**
     * Regenerate session
     * @param {(err: any) => void} callback
     */
    regenerate(callback: (err: any) => void): void;
    /**
     * Destroy session
     * @param  {(err: any) => void} callback
     * @return {void}
     */
    destroy(callback: (err: any) => void): void;
    /**
     * Reload session
     * @param  {(err: any) => void} callback
     * @return {void}
     */
    reload(callback: (err: any) => void): void;
    /**
     * Save session
     * @param {(err: any) => void} callback
     */
    save(callback: (err: any) => void): void;
    /**
     * Touch session
     * @param {(err: any) => void} callback
     */
    touch(callback: (err: any) => void): void;
    /**
     * Session cookie
     * @return {Express.SessionCookie}
     */
    readonly cookie: Express.SessionCookie;
    /**
     * Session id
     * @return {any}
     */
    readonly id: any;
    /**
     * Reset session max age
     */
    resetMaxAge(): void;
    /**
     * Get value and remove it from session
     * @param  {string} key
     * @param  {any} defaultVal
     * @return {any}
     */
    flash(key: string, defaultVal?: any): any;
    /**
     * Get value from session
     * @param  {string} key
     * @param  {any} defaultVal
     * @return {any}
     */
    get(key: string, defaultVal?: any): any;
    /**
     * Remove from session
     * @param  {string} key
     * @return {void}
     */
    delete(key: string): void;
    /**
     * Check if key is marked as flash
     * @param  {string} key
     * @return {boolean}
     */
    isFlash(key: string): boolean;
    /**
     * Save value to session
     * @param  {string} key
     * @param  {any} value
     * @return {void}
     */
    set(key: string, value: any): void;
    /**
     * Check if key exists in session
     * @param  {string} key
     * @return {boolean}
     */
    has(key: string): boolean;
    /**
     * Mark existing data as flash
     * @param  {string} key
     * @return {void}
     */
    markAsFlash(key: string): void;
    /**
     * Unmark existing data as flash
     * @param  {string} key
     * @return {void}
     */
    unmarkAsFlash(key: string): void;
    /**
     * Set flash data
     * @param  {string} key
     * @param  {any} value
     * @return {void}
     */
    setFlash(key: string, value: any): void;
}
/**
 * Install session storage
 * @param  {T} app
 * @return {void}
 */
export declare function installSessionStorage<T extends express.Server>(app: T): void;
