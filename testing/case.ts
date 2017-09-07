import { _, Metadata } from '../core/misc';
import { TestService } from './service';
import { Error } from '../core/error';
import { TestRunner } from './runner';

/**
 * TestHookContext interface
 */
export interface TestHookContext extends Mocha.IBeforeAndAfterContext {}

/**
 * TestCaseContext interface
 */
export interface TestCaseContext extends Mocha.ITestCallbackContext {}

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
export function TestSuite(description?: string) {
  return (target: Function) => {

    if (!_.classExtends(target, TestService)) {
      throw new Error(`${target.name} class must extends TestService`);
    }

    const testCases: ITestCase[] = Metadata.get(target.prototype, 'test:cases') || [];
    const beforeTestCases: IBefore[] = Metadata.get(target.prototype, 'test:before') || [];
    const beforeEachTestCases: IBeforeEach[] = Metadata.get(target.prototype, 'test:beforeEach') || [];
    const afterTestCases: IAfter[] = Metadata.get(target.prototype, 'test:after') || [];
    const afterEachTestCases: IAfterEach[] = Metadata.get(target.prototype, 'test:afterEach') || [];

    Metadata.set(target.prototype, 'test:suite', {
      description: description || target.name,
      callback: function () {

        let testService: TestService;
        before(() => testService = Reflect.construct(target, [TestRunner.app.context.newInstance(), TestRunner.httpTestClient]));

        beforeTestCases.forEach(beforeTestCase => {
          before(beforeTestCase.description, function () {
            return (testService as any)[beforeTestCase.methodName](this);
          });
        });

        beforeEachTestCases.forEach(beforeEachTestCase => {
          beforeEach(beforeEachTestCase.description, function () {
            return (testService as any)[beforeEachTestCase.methodName](this);
          });
        });

        afterTestCases.forEach(afterTestCase => {
          after(afterTestCase.description, function () {
            return (testService as any)[afterTestCase.methodName](this);
          });
        });

        afterEachTestCases.forEach(afterEachTestCase => {
          afterEach(afterEachTestCase.description, function () {
            return (testService as any)[afterEachTestCase.methodName](this);
          });
        });

        testCases.forEach(testCase => {
          it(testCase.description, function () {
            return (testService as any)[testCase.methodName](this);
          });
        });
      }
    });
  };
}

/**
 * ITestCase interface
 */
interface ITestCase {
  methodName: string;
  description: string;
}

/**
 * TestCase decorator for TestService method
 */
export function TestCase(description?: string) {
  return (target: Object, propertyKey: string, desc: PropertyDescriptor) => {

    let testCases: ITestCase[] = Metadata.get(target, 'test:cases');
    if (!Array.isArray(testCases)) {
      testCases = [];
    }

    testCases.push({ methodName: propertyKey, description: description || propertyKey });
    Metadata.set(target, 'test:cases', testCases);
  };
}

/**
 * IBefore interface
 */
interface IBefore {
  methodName: string;
  description: string;
}

/**
 * Before decorator for TestService method
 */
export function Before(description?: string) {
  return (target: Object, propertyKey: string, desc: PropertyDescriptor) => {

    let beforeTestCases: IBefore[] = Metadata.get(target, 'test:before');
    if (!Array.isArray(beforeTestCases)) {
      beforeTestCases = [];
    }

    beforeTestCases.push({ methodName: propertyKey, description: description || propertyKey });
    Metadata.set(target, 'test:before', beforeTestCases);
  };
}

/**
 * IBefore interface
 */
interface IBeforeEach {
  methodName: string;
  description: string;
}

/**
 * BeforeEach decorator for TestService method
 */
export function BeforeEach(description?: string) {
  return (target: Object, propertyKey: string, desc: PropertyDescriptor) => {

    let beforeEachTestCases: IBeforeEach[] = Metadata.get(target, 'test:beforeEach');
    if (!Array.isArray(beforeEachTestCases)) {
      beforeEachTestCases = [];
    }

    beforeEachTestCases.push({ methodName: propertyKey, description: description || propertyKey });
    Metadata.set(target, 'test:beforeEach', beforeEachTestCases);
  };
}

/**
 * IAfter interface
 */
interface IAfter {
  methodName: string;
  description: string;
}

/**
 * After decorator for TestService method
 */
export function After(description?: string) {
  return (target: Object, propertyKey: string, desc: PropertyDescriptor) => {

    let afterTestCases: IAfter[] = Metadata.get(target, 'test:after');
    if (!Array.isArray(afterTestCases)) {
      afterTestCases = [];
    }

    afterTestCases.push({ methodName: propertyKey, description: description || propertyKey });
    Metadata.set(target, 'test:after', afterTestCases);
  };
}

/**
 * IAfterEach interface
 */
interface IAfterEach {
  methodName: string;
  description: string;
}

/**
 * BeforeEach decorator for TestService method
 */
export function AfterEach(description?: string) {
  return (target: Object, propertyKey: string, desc: PropertyDescriptor) => {

    let afterEachTestCases: IAfterEach[] = Metadata.get(target, 'test:afterEach');
    if (!Array.isArray(afterEachTestCases)) {
      afterEachTestCases = [];
    }

    afterEachTestCases.push({ methodName: propertyKey, description: description || propertyKey });
    Metadata.set(target, 'test:afterEach', afterEachTestCases);
  };
}
