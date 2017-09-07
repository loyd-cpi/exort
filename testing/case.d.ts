/// <reference types="mocha" />
/**
 * TestHookContext interface
 */
export interface TestHookContext extends Mocha.IBeforeAndAfterContext {
}
/**
 * TestCaseContext interface
 */
export interface TestCaseContext extends Mocha.ITestCallbackContext {
}
/**
 * ITestSuite interface
 */
export interface ITestSuite {
    description: string;
    callback: (this: Mocha.ISuiteCallbackContext) => void;
}
/**
 * TestSuite decorator for TestService
 */
export declare function TestSuite(description?: string): (target: Function) => void;
/**
 * TestCase decorator for TestService method
 */
export declare function TestCase(description?: string): (target: Object, propertyKey: string, desc: PropertyDescriptor) => void;
/**
 * Before decorator for TestService method
 */
export declare function Before(description?: string): (target: Object, propertyKey: string, desc: PropertyDescriptor) => void;
/**
 * BeforeEach decorator for TestService method
 */
export declare function BeforeEach(description?: string): (target: Object, propertyKey: string, desc: PropertyDescriptor) => void;
/**
 * After decorator for TestService method
 */
export declare function After(description?: string): (target: Object, propertyKey: string, desc: PropertyDescriptor) => void;
/**
 * BeforeEach decorator for TestService method
 */
export declare function AfterEach(description?: string): (target: Object, propertyKey: string, desc: PropertyDescriptor) => void;
