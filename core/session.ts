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
   */
  private static FLASH_KEY: string = '__$$flash';

  /**
   * Userdata key
   */
  private static USERDATA_KEY: string = '__$$userdata';

  /**
   * Session constructor
   */
  constructor(private express: Express.Session) {}

  /**
   * Regenerate session
   */
  public regenerate(callback: (err: any) => void): void {
    this.express.regenerate(callback);
  }

  /**
   * Destroy session
   */
  public destroy(callback: (err: any) => void): void {
    this.express.destroy(callback);
  }

  /**
   * Reload session
   */
  public reload(callback: (err: any) => void): void {
    this.express.reload(callback);
  }

  /**
   * Save session
   */
  public save(callback: (err: any) => void): void {
    this.express.save(callback);
  }

  /**
   * Touch session
   */
  public touch(callback: (err: any) => void): void {
    this.express.touch(callback);
  }

  /**
   * Session cookie
   */
  public get cookie(): Express.SessionCookie {
    return this.express.cookie;
  }

  /**
   * Session id
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
   */
  public isFlash(key: string): boolean {
    if (!Array.isArray(this.express[Session.FLASH_KEY])) return false;
    return this.express[Session.FLASH_KEY].indexOf(key) != -1;
  }

  /**
   * Save value to session
   */
  public set(key: string, value: any): void {
    if (!this.express[Session.USERDATA_KEY]) {
      this.express[Session.USERDATA_KEY] = {};
    }
    this.express[Session.USERDATA_KEY][key] = value;
  }

  /**
   * Check if key exists in session
   */
  public has(key: string): boolean {
    if (typeof this.express[Session.USERDATA_KEY] != 'object') return false;
    return typeof this.express[Session.USERDATA_KEY][key] != 'undefined';
  }

  /**
   * Mark existing data as flash
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
   */
  public setFlash(key: string, value: any): void {
    this.set(key, value);
    this.markAsFlash(key);
  }
}

/**
 * Provide session storage
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
