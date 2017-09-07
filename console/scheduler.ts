import { checkAppConfig, AppProvider } from '../core/app';
import { Console, ConsoleApplication } from './app';
import { KeyValuePair } from '../core/misc';
import { Arguments } from './command';
import { Error } from '../core/error';
import { Log } from '../core/logger';
import * as cron from 'cron';

/**
 * Task interface
 */
export interface AsyncTask {
  (): Promise<void>;
}

/**
 * Schedule class
 */
export class Schedule {

  /**
   * CronJob instance
   */
  private job: cron.CronJob;

  /**
   * Crontab
   */
  private cronTab: string;

  /**
   * Schedule constructor
   */
  constructor(private app: ConsoleApplication, private task: AsyncTask) {}

  /**
   * Initialize CronJob instance
   */
  private resetCronJob() {
    if (this.job && this.job.running) {
      this.job.stop();
    }

    this.job = new cron.CronJob({
      cronTime: this.cronTab,
      onTick: () => {
        this.task().catch(err => Log.error(this.app, err));
      }
    });
  }

  /**
   * Set a crontab for the job
   */
  public cron(cronTab: string) {
    this.cronTab = cronTab;
    this.resetCronJob();
  }

  /**
   * Get job instance
   */
  public getJob() {
    if (!this.job) {
      throw new Error('No cron job was initialized');
    }
    return this.job;
  }
}

/**
 * Scheduler class
 */
export class Scheduler {

  /**
   * Default group name
   */
  private groupName: string = 'default';

  /**
   * Grouping of schedules
   */
  private calendar: KeyValuePair<Schedule[]> = {};

  /**
   * Scheduler constructor
   */
  constructor(private app: ConsoleApplication) {
    this.calendar[this.groupName] = [];
  }

  /**
   * Schedules under the closure will saved to the given group name
   */
  public group(name: string, closure: (scheduler: Scheduler) => void)  {
    let prevGroupName = this.groupName;

    this.groupName = name;
    if (!this.calendar[this.groupName]) {
      this.calendar[this.groupName] = [];
    }

    closure(this);

    this.groupName = prevGroupName;
  }

  /**
   * Create a schedule for a command
   */
  public command(command: string, params?: string[]): Schedule {
    params = Array.isArray(params) ? params : [];
    params.unshift(command);

    let schedule = new Schedule(this.app, async () => Console.execute(params as string[]));
    this.calendar[this.groupName].push(schedule);

    return schedule;
  }

  /**
   * Get scheduled jobs
   */
  public getSchedules(groupName?: string): Schedule[] {
    if (!groupName) {
      let schedules: Schedule[] = [];
      for (let groupName in this.calendar) {
        schedules = schedules.concat(this.calendar[groupName]);
      }
      return schedules;
    }
    return this.calendar[groupName];
  }
}

/**
 * Starter of scheduled jobs
 */
export class ScheduledJobRunner {

  /**
   * ScheduledJobRunner constructor
   */
  constructor(private scheduler: Scheduler) {}

  /**
   * Run scheduled jobs
   */
  public run(groupName?: string) {
    let schedules = this.scheduler.getSchedules(groupName);
    schedules.forEach(schedule => schedule.getJob().start());
  }
}

/**
 * Provide scheduled commands
 */
export function provideScheduler(schedulesModule?: string): AppProvider {
  return async (app: ConsoleApplication): Promise<void> => {
    checkAppConfig(app);

    Console.addCommand(app, {
      command: 'schedule:run',
      desc: 'evaluate your scheduled tasks and runs the tasks that are due.',
      params: {
        group: {
          required: false
        }
      },
      async handler(argv: Arguments) {

        let schedules = require(schedulesModule || `${app.bootDir}/schedules`);
        if (typeof schedules != 'object') {
          throw new Error('Invalid schedules file');
        }

        if (typeof schedules.setup != 'function') {
          throw new Error('schedules file should be setup function');
        }

        let scheduler = new Scheduler(app);
        schedules.setup(scheduler);

        new ScheduledJobRunner(scheduler).run(argv.group);
        return false;
      }
    });
  };
}
