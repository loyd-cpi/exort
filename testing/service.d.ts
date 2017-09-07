/// <reference types="supertest" />
import { Service, Context } from '../core/service';
import { WebApplication } from '../web/app';
import * as supertest from 'supertest';
/**
 * HttpTest interface
 */
export interface HttpTestClient extends supertest.SuperTest<supertest.Test> {
}
/**
 * Abstract TestService class
 */
export declare abstract class TestService extends Service {
    protected readonly httpClient: HttpTestClient;
    /**
     * WebApplication instance
     */
    protected readonly app: WebApplication;
    /**
     * TestService constructor
     */
    constructor(context: Context, httpClient: HttpTestClient);
}
