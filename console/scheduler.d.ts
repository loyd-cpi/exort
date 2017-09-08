import { AppProvider } from '../core/app';
import { ConsoleApplication } from './app';
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
export declare class Schedule {
    private app;
    private task;
    /**
     * CronJob instance
     */
    private job;
    /**
     * Crontab
     */
    private cronTab;
    /**
     * Schedule timezone
     */
    private timezone;
    /**
     * Schedule constructor
     */
    constructor(app: ConsoleApplication, task: AsyncTask);
    /**
     * Initialize CronJob instance
     */
    private resetCronJob();
    /**
     * Set a crontab for the job
     */
    cron(cronTab: string, timezone?: string): void;
    /**
     * Get job instance
     */
    getJob(): cron.CronJob;
}
/**
 * Scheduler class
 */
export declare class Scheduler {
    private app;
    /**
     * Default group name
     */
    private groupName;
    /**
     * Grouping of schedules
     */
    private calendar;
    /**
     * Scheduler constructor
     */
    constructor(app: ConsoleApplication);
    /**
     * Schedules under the closure will saved to the given group name
     */
    group(name: string, closure: (scheduler: Scheduler) => void): void;
    /**
     * Create a schedule for a command
     */
    command(command: string, params?: string[]): Schedule;
    /**
     * Get scheduled jobs
     */
    getSchedules(groupName?: string): Schedule[];
}
/**
 * Starter of scheduled jobs
 */
export declare class ScheduledJobRunner {
    private scheduler;
    /**
     * ScheduledJobRunner constructor
     */
    constructor(scheduler: Scheduler);
    /**
     * Run scheduled jobs
     */
    run(groupName?: string): void;
}
/**
 * Provide scheduled commands
 */
export declare function provideScheduler(schedulesModule?: string): AppProvider;
