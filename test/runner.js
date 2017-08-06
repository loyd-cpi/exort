"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("../core/app");
const command_1 = require("../console/command");
const misc_1 = require("../core/misc");
const http_1 = require("../web/http");
const pathlib = require("path");
const Mocha = require("mocha");
const fs = require("fs");
/**
 * TestRunner class
 */
class TestRunner extends Mocha {
}
exports.TestRunner = TestRunner;
/**
 * Create testable application instance
 */
function createTestApplication(bootDir, configFiles) {
    const app = app_1.createApplication(bootDir, configFiles);
    app.testMode = true;
    return app;
}
exports.createTestApplication = createTestApplication;
/**
 * Start running tests
 */
function startTesting(app, testCasesDir) {
    app_1.checkAppConfig(app);
    if (testCasesDir) {
        testCasesDir = pathlib.normalize(misc_1._.trimEnd(testCasesDir, '/'));
    }
    else {
        testCasesDir = `${app.dir}/tests/cases`;
    }
    describe('Preparing test cases...', function () {
        before('Preparing application...', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                TestRunner.app = yield http_1.startServer(app);
            });
        });
        fs.readdirSync(testCasesDir)
            .forEach(testCaseFile => {
            if (pathlib.extname(testCaseFile) == '.js') {
                const TestSuiteClass = misc_1._.requireClass(`${testCasesDir}/${testCaseFile}`);
                const testSuite = misc_1.Metadata.get(TestSuiteClass.prototype, 'test:suite');
                if (testSuite) {
                    describe(testSuite.description, testSuite.callback);
                }
            }
        });
    });
}
exports.startTesting = startTesting;
/**
 * Provide test commands
 */
function provideTestCommands(runnerFile) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        if (runnerFile) {
            if (!pathlib.extname(runnerFile)) {
                runnerFile = `${runnerFile}.js`;
            }
        }
        else {
            runnerFile = `${app.dir}/tests/run.js`;
        }
        command_1.Console.addCommand({
            command: 'test:run',
            desc: 'Run tests',
            params: {},
            handler(argv) {
                return new Promise((resolve, reject) => {
                    const testRunner = new TestRunner();
                    testRunner.addFile(runnerFile);
                    testRunner.run(failures => resolve());
                });
            }
        });
    });
}
exports.provideTestCommands = provideTestCommands;
//# sourceMappingURL=runner.js.map