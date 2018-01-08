import { WebApplication } from '../web/app';
import { Service } from '../core/handler';
import { Context } from '../core/service';
import * as supertest from 'supertest';

/**
 * HttpTest interface
 */
export interface HttpTestClient extends supertest.SuperTest<supertest.Test> {}

/**
 * Abstract TestService class
 */
export abstract class TestService extends Service {

  /**
   * WebApplication instance
   */
  protected readonly app: WebApplication;

  /**
   * TestService constructor
   */
  constructor(context: Context, protected readonly httpClient: HttpTestClient) {
    super(context);
  }
}
