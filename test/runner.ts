import { Application, checkAppConfig, AppProvider, createApplication } from '../core/app';
import { Console, Arguments } from '../console/command';
import { WebApplication } from '../web/app';
import { Metadata, _ } from '../core/misc';
import { startServer } from '../web/http';
import { ITestSuite } from './case';
import * as pathlib from 'path';
import * as Mocha from 'mocha';
import * as fs from 'fs';

/**
 * TestRunner class
 */
export class TestRunner extends Mocha {

  /**
   * WebApplication instance to test
   */
  public static readonly app: WebApplication;
}

/**
 * Create testable application instance
 */
export function createTestApplication(bootDir: string, configFiles?: string | string[]): Application {
  const app = createApplication(bootDir, configFiles as any);
  (app as any).testMode = true;
  return app;
}

/**
 * Start running tests
 */
export function startTesting(app: Application, testCasesDir?: string) {
  checkAppConfig(app);
  if (testCasesDir) {
    testCasesDir = pathlib.normalize(_.trimEnd(testCasesDir, '/'));
  } else {
    testCasesDir = `${app.dir}/tests/cases`;
  }

  describe('Preparing test cases...', function () {

    before('Preparing application...', async function () {
      (TestRunner as any).app = await startServer(app);
    });

    fs.readdirSync(testCasesDir as string)
      .forEach(testCaseFile => {
        if (pathlib.extname(testCaseFile) == '.js') {

          const TestSuiteClass = _.requireClass(`${testCasesDir}/${testCaseFile}`);
          const testSuite: ITestSuite = Metadata.get(TestSuiteClass.prototype, 'test:suite');
          if (testSuite) {
            describe(testSuite.description, testSuite.callback);
          }
        }
      });
  });
}

/**
 * Provide test commands
 */
export function provideTestCommands(runnerFile?: string): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    if (runnerFile) {
      if (!pathlib.extname(runnerFile)) {
        runnerFile = `${runnerFile}.js`;
      }
    } else {
      runnerFile = `${app.dir}/tests/run.js`;
    }

    Console.addCommand({
      command: 'test:run',
      desc: 'Run tests',
      params: {},
      handler(argv: Arguments) {
        return new Promise<void>((resolve, reject) => {

          const testRunner = new TestRunner();
          testRunner.addFile(runnerFile as string);
          testRunner.run(failures => resolve());
        });
      }
    });
  };
}
