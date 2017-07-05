"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const expressSession = require("express-session");
const misc_1 = require("./misc");
/**
 * Session class
 */
class Session {
    /**
     * Session constructor
     * @param {Express.Session} private express
     */
    constructor(express) {
        this.express = express;
    }
    /**
     * Regenerate session
     * @param {(err: any) => void} callback
     */
    regenerate(callback) {
        this.express.regenerate(callback);
    }
    /**
     * Destroy session
     * @param  {(err: any) => void} callback
     * @return {void}
     */
    destroy(callback) {
        this.express.destroy(callback);
    }
    /**
     * Reload session
     * @param  {(err: any) => void} callback
     * @return {void}
     */
    reload(callback) {
        this.express.reload(callback);
    }
    /**
     * Save session
     * @param {(err: any) => void} callback
     */
    save(callback) {
        this.express.save(callback);
    }
    /**
     * Touch session
     * @param {(err: any) => void} callback
     */
    touch(callback) {
        this.express.touch(callback);
    }
    /**
     * Session cookie
     * @return {Express.SessionCookie}
     */
    get cookie() {
        return this.express.cookie;
    }
    /**
     * Session id
     * @return {any}
     */
    get id() {
        return this.express['id'];
    }
    /**
     * Reset session max age
     */
    resetMaxAge() {
        this.express['resetMaxAge']();
    }
    /**
     * Get value and remove it from session
     * @param  {string} key
     * @param  {any} defaultVal
     * @return {any}
     */
    flash(key, defaultVal) {
        let val;
        if (this.has(key)) {
            val = this.express[Session.USERDATA_KEY][key];
        }
        val = misc_1._.defaultIfNone(val, defaultVal);
        this.delete(key);
        this.unmarkAsFlash(key);
        return val;
    }
    /**
     * Get value from session
     * @param  {string} key
     * @param  {any} defaultVal
     * @return {any}
     */
    get(key, defaultVal) {
        if (this.isFlash(key)) {
            return this.flash(key, defaultVal);
        }
        let val;
        if (this.has(key)) {
            val = this.express[Session.USERDATA_KEY][key];
        }
        val = misc_1._.defaultIfNone(val, defaultVal);
        if (typeof val == 'object' && val) {
            return misc_1._.clone(val);
        }
        return val;
    }
    /**
     * Remove from session
     * @param  {string} key
     * @return {void}
     */
    delete(key) {
        if (this.has(key)) {
            delete this.express[Session.USERDATA_KEY][key];
            if (!Object.keys(this.express[Session.USERDATA_KEY]).length) {
                delete this.express[Session.USERDATA_KEY];
            }
        }
    }
    /**
     * Check if key is marked as flash
     * @param  {string} key
     * @return {boolean}
     */
    isFlash(key) {
        if (!Array.isArray(this.express[Session.FLASH_KEY]))
            return false;
        return this.express[Session.FLASH_KEY].indexOf(key) != -1;
    }
    /**
     * Save value to session
     * @param  {string} key
     * @param  {any} value
     * @return {void}
     */
    set(key, value) {
        if (!this.express[Session.USERDATA_KEY]) {
            this.express[Session.USERDATA_KEY] = {};
        }
        this.express[Session.USERDATA_KEY][key] = value;
    }
    /**
     * Check if key exists in session
     * @param  {string} key
     * @return {boolean}
     */
    has(key) {
        if (typeof this.express[Session.USERDATA_KEY] != 'object')
            return false;
        return typeof this.express[Session.USERDATA_KEY][key] != 'undefined';
    }
    /**
     * Mark existing data as flash
     * @param  {string} key
     * @return {void}
     */
    markAsFlash(key) {
        if (this.has(key)) {
            if (!Array.isArray(this.express[Session.FLASH_KEY])) {
                this.express[Session.FLASH_KEY] = [key];
            }
            else if (!this.isFlash(key)) {
                this.express[Session.FLASH_KEY].push(key);
            }
        }
    }
    /**
     * Unmark existing data as flash
     * @param  {string} key
     * @return {void}
     */
    unmarkAsFlash(key) {
        if (Array.isArray(this.express[Session.FLASH_KEY])) {
            let pos = this.express[Session.FLASH_KEY].indexOf(key);
            if (pos != -1) {
                this.express[Session.FLASH_KEY].splice(pos, 1);
                if (!this.express[Session.FLASH_KEY].length) {
                    delete this.express[Session.FLASH_KEY];
                }
            }
        }
    }
    /**
     * Set flash data
     * @param  {string} key
     * @param  {any} value
     * @return {void}
     */
    setFlash(key, value) {
        this.set(key, value);
        this.markAsFlash(key);
    }
}
/**
 * Flash key
 * @type {string}
 */
Session.FLASH_KEY = '__$$flash';
/**
 * Userdata key
 * @type {string}
 */
Session.USERDATA_KEY = '__$$userdata';
exports.Session = Session;
/**
 * Provide session storage
 * @return {AppProvider}
 */
function provideSessionStorage() {
    return (app) => __awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        let sessionConf = app.config.get('session');
        if (!sessionConf)
            return;
        if (!sessionConf.secret) {
            sessionConf.secret = app.config.get('app.key');
        }
        let driver = 'memory';
        if (sessionConf.store && sessionConf.store.driver) {
            driver = sessionConf.store.driver;
        }
        let params = misc_1._.clone(sessionConf);
        switch (driver) {
            case 'redis':
                let redisStore = require('connect-redis')(expressSession);
                params.store = new redisStore(params.store.connection);
                break;
            default:
                delete params.store;
                break;
        }
        let sessionFn = expressSession(params);
        app.use((request, response, next) => {
            sessionFn(request, response, err => {
                if (err)
                    return next(err);
                request.session = new Session(request.session);
                next();
            });
        });
    });
}
exports.provideSessionStorage = provideSessionStorage;
//# sourceMappingURL=session.js.map