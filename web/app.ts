import { Application, AppBootstrap } from '../core/app';
import * as http from 'http';

/**
 * Abstract HttpBootstrap class
 */
export abstract class HttpBootstrap extends AppBootstrap {}

/**
 * WebApplication interface
 */
export interface WebApplication extends Application {

  /**
   * Server instance
   */
  readonly server: http.Server;
}
