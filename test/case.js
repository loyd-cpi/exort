"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const misc_1 = require("../core/misc");
const service_1 = require("./service");
const error_1 = require("../core/error");
const runner_1 = require("./runner");
/**
 * TestSuite decorator for TestService
 */
function TestSuite(description) {
    return (target) => {
        if (!misc_1._.classExtends(target, service_1.TestService)) {
            throw new error_1.Error(`${target.name} class must extends TestService`);
        }
        const testCases = misc_1.Metadata.get(target.prototype, 'test:cases') || [];
        const beforeTestCases = misc_1.Metadata.get(target.prototype, 'test:before') || [];
        const beforeEachTestCases = misc_1.Metadata.get(target.prototype, 'test:beforeEach') || [];
        const afterTestCases = misc_1.Metadata.get(target.prototype, 'test:after') || [];
        const afterEachTestCases = misc_1.Metadata.get(target.prototype, 'test:afterEach') || [];
        misc_1.Metadata.set(target.prototype, 'test:suite', {
            description: description || target.name,
            callback: function () {
                let testService;
                before(() => testService = Reflect.construct(target, [runner_1.TestRunner.app.context.newInstance()]));
                beforeTestCases.forEach(beforeTestCase => {
                    before(beforeTestCase.description, function () {
                        return testService[beforeTestCase.methodName](this);
                    });
                });
                beforeEachTestCases.forEach(beforeEachTestCase => {
                    beforeEach(beforeEachTestCase.description, function () {
                        return testService[beforeEachTestCase.methodName](this);
                    });
                });
                afterTestCases.forEach(afterTestCase => {
                    after(afterTestCase.description, function () {
                        return testService[afterTestCase.methodName](this);
                    });
                });
                afterEachTestCases.forEach(afterEachTestCase => {
                    afterEach(afterEachTestCase.description, function () {
                        return testService[afterEachTestCase.methodName](this);
                    });
                });
                testCases.forEach(testCase => {
                    it(testCase.description, function () {
                        return testService[testCase.methodName](this);
                    });
                });
            }
        });
    };
}
exports.TestSuite = TestSuite;
/**
 * TestCase decorator for TestService method
 */
function TestCase(description) {
    return (target, propertyKey, desc) => {
        let testCases = misc_1.Metadata.get(target, 'test:cases');
        if (!Array.isArray(testCases)) {
            testCases = [];
        }
        testCases.push({ methodName: propertyKey, description: description || propertyKey });
        misc_1.Metadata.set(target, 'test:cases', testCases);
    };
}
exports.TestCase = TestCase;
/**
 * Before decorator for TestService method
 */
function Before(description) {
    return (target, propertyKey, desc) => {
        let beforeTestCases = misc_1.Metadata.get(target, 'test:before');
        if (!Array.isArray(beforeTestCases)) {
            beforeTestCases = [];
        }
        beforeTestCases.push({ methodName: propertyKey, description: description || propertyKey });
        misc_1.Metadata.set(target, 'test:before', beforeTestCases);
    };
}
exports.Before = Before;
/**
 * BeforeEach decorator for TestService method
 */
function BeforeEach(description) {
    return (target, propertyKey, desc) => {
        let beforeEachTestCases = misc_1.Metadata.get(target, 'test:beforeEach');
        if (!Array.isArray(beforeEachTestCases)) {
            beforeEachTestCases = [];
        }
        beforeEachTestCases.push({ methodName: propertyKey, description: description || propertyKey });
        misc_1.Metadata.set(target, 'test:beforeEach', beforeEachTestCases);
    };
}
exports.BeforeEach = BeforeEach;
/**
 * After decorator for TestService method
 */
function After(description) {
    return (target, propertyKey, desc) => {
        let afterTestCases = misc_1.Metadata.get(target, 'test:after');
        if (!Array.isArray(afterTestCases)) {
            afterTestCases = [];
        }
        afterTestCases.push({ methodName: propertyKey, description: description || propertyKey });
        misc_1.Metadata.set(target, 'test:after', afterTestCases);
    };
}
exports.After = After;
/**
 * BeforeEach decorator for TestService method
 */
function AfterEach(description) {
    return (target, propertyKey, desc) => {
        let afterEachTestCases = misc_1.Metadata.get(target, 'test:afterEach');
        if (!Array.isArray(afterEachTestCases)) {
            afterEachTestCases = [];
        }
        afterEachTestCases.push({ methodName: propertyKey, description: description || propertyKey });
        misc_1.Metadata.set(target, 'test:afterEach', afterEachTestCases);
    };
}
exports.AfterEach = AfterEach;
//# sourceMappingURL=case.js.map