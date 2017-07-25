/// <reference types="express-session" />
import { AppProvider } from '../core/app';
/**
 * Session class
 */
export declare class Session implements Express.Session {
    private express;
    /**
     * Flash key
     */
    private static FLASH_KEY;
    /**
     * Userdata key
     */
    private static USERDATA_KEY;
    /**
     * Session constructor
     */
    constructor(express: Express.Session);
    /**
     * Regenerate session
     */
    regenerate(callback: (err: any) => void): void;
    /**
     * Destroy session
     */
    destroy(callback: (err: any) => void): void;
    /**
     * Reload session
     */
    reload(callback: (err: any) => void): void;
    /**
     * Save session
     */
    save(callback: (err: any) => void): void;
    /**
     * Touch session
     */
    touch(callback: (err: any) => void): void;
    /**
     * Session cookie
     */
    readonly cookie: Express.SessionCookie;
    /**
     * Session id
     */
    readonly id: any;
    /**
     * Reset session max age
     */
    resetMaxAge(): void;
    /**
     * Get value and remove it from session
     */
    flash(key: string, defaultVal?: any): any;
    /**
     * Get value from session
     */
    get(key: string, defaultVal?: any): any;
    /**
     * Remove from session
     */
    delete(key: string): void;
    /**
     * Check if key is marked as flash
     */
    isFlash(key: string): boolean;
    /**
     * Save value to session
     */
    set(key: string, value: any): void;
    /**
     * Check if key exists in session
     */
    has(key: string): boolean;
    /**
     * Mark existing data as flash
     */
    markAsFlash(key: string): void;
    /**
     * Unmark existing data as flash
     */
    unmarkAsFlash(key: string): void;
    /**
     * Set flash data
     */
    setFlash(key: string, value: any): void;
}
/**
 * Provide session storage
 */
export declare function provideSessionStorage(): AppProvider;
