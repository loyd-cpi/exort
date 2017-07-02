import { checkAppConfig, Application, AppProvider } from './app';
import * as expressSession from 'express-session';
import * as express from 'express';
import { Request } from './http';
import { _ } from './misc';

/**
 * Session class
 */
export class Session implements Express.Session {

  /**
   * Flash key
   * @type {string}
   */
  private static FLASH_KEY: string = '__$$flash';

  /**
   * Userdata key
   * @type {string}
   */
  private static USERDATA_KEY: string = '__$$userdata';

  /**
   * Session constructor
   * @param {Express.Session} private express
   */
  constructor(private express: Express.Session) {}

  /**
   * Regenerate session
   * @param {(err: any) => void} callback
   */
  public regenerate(callback: (err: any) => void): void {
    this.express.regenerate(callback);
  }

  /**
   * Destroy session
   * @param  {(err: any) => void} callback
   * @return {void}
   */
  public destroy(callback: (err: any) => void): void {
    this.express.destroy(callback);
  }

  /**
   * Reload session
   * @param  {(err: any) => void} callback
   * @return {void}
   */
  public reload(callback: (err: any) => void): void {
    this.express.reload(callback);
  }

  /**
   * Save session
   * @param {(err: any) => void} callback
   */
  public save(callback: (err: any) => void): void {
    this.express.save(callback);
  }

  /**
   * Touch session
   * @param {(err: any) => void} callback
   */
  public touch(callback: (err: any) => void): void {
    this.express.touch(callback);
  }

  /**
   * Session cookie
   * @return {Express.SessionCookie}
   */
  public get cookie(): Express.SessionCookie {
    return this.express.cookie;
  }

  /**
   * Session id
   * @return {any}
   */
  public get id(): any {
    return this.express['id'];
  }

  /**
   * Reset session max age
   */
  public resetMaxAge(): void {
    this.express['resetMaxAge']();
  }

  /**
   * Get value and remove it from session
   * @param  {string} key
   * @param  {any} defaultVal
   * @return {any}
   */
  public flash(key: string, defaultVal?: any): any {
    let val;
    if (this.has(key)) {
      val = this.express[Session.USERDATA_KEY][key];
    }
    val = _.defaultIfNone(val, defaultVal);
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
  public get(key: string, defaultVal?: any): any {
    if (this.isFlash(key)) {
      return this.flash(key, defaultVal);
    }
    let val;
    if (this.has(key)) {
      val = this.express[Session.USERDATA_KEY][key];
    }
    val = _.defaultIfNone(val, defaultVal);
    if (typeof val == 'object' && val) {
      return _.clone(val);
    }
    return val;
  }

  /**
   * Remove from session
   * @param  {string} key
   * @return {void}
   */
  public delete(key: string): void {
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
  public isFlash(key: string): boolean {
    if (!Array.isArray(this.express[Session.FLASH_KEY])) return false;
    return this.express[Session.FLASH_KEY].indexOf(key) != -1;
  }

  /**
   * Save value to session
   * @param  {string} key
   * @param  {any} value
   * @return {void}
   */
  public set(key: string, value: any): void {
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
  public has(key: string): boolean {
    if (typeof this.express[Session.USERDATA_KEY] != 'object') return false;
    return typeof this.express[Session.USERDATA_KEY][key] != 'undefined';
  }

  /**
   * Mark existing data as flash
   * @param  {string} key
   * @return {void}
   */
  public markAsFlash(key: string): void {
    if (this.has(key)) {
      if (!Array.isArray(this.express[Session.FLASH_KEY])) {
        this.express[Session.FLASH_KEY] = [key];
      } else if (!this.isFlash(key)) {
        this.express[Session.FLASH_KEY].push(key);
      }
    }
  }

  /**
   * Unmark existing data as flash
   * @param  {string} key
   * @return {void}
   */
  public unmarkAsFlash(key: string): void {
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
  public setFlash(key: string, value: any): void {
    this.set(key, value);
    this.markAsFlash(key);
  }
}

/**
 * Provide session storage
 * @return {AppProvider}
 */
export function provideSessionStorage(): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    let sessionConf = app.config.get('session');
    if (!sessionConf) return;

    if (!sessionConf.secret) {
      sessionConf.secret = app.config.get('app.key');
    }

    let driver = 'memory';
    if (sessionConf.store && sessionConf.store.driver) {
      driver = sessionConf.store.driver;
    }

    let params = _.clone(sessionConf);
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
    app.use((request: Request, response: express.Response, next: express.NextFunction) => {
      sessionFn(request, response, err => {

        if (err) return next(err);
        request.session = new Session(request.session);
        next();
      });
    });
  };
}
