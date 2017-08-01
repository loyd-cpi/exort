/// <reference types="supertest" />
import { WebApplication } from '../web/app';
import { Service } from '../core/service';
import * as supertest from 'supertest';
/**
 * HttpTest interface
 */
export interface HttpTest extends supertest.SuperTest<supertest.Test> {
}
/**
 * Abstract TestService class
 */
export declare abstract class TestService extends Service {
    /**
     * WebApplication instance
     */
    protected readonly app: WebApplication;
    /**
     * Supertest instance
     */
    private supertestInstance;
    /**
     * Create and get supertest instance
     */
    protected createHttpTest(): HttpTest;
}
