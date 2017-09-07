"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = require("../core/app");
const app_2 = require("./app");
const error_1 = require("../core/error");
const logger_1 = require("../core/logger");
const cron = require("cron");
/**
 * Schedule class
 */
class Schedule {
    /**
     * Schedule constructor
     */
    constructor(app, task) {
        this.app = app;
        this.task = task;
    }
    /**
     * Initialize CronJob instance
     */
    resetCronJob() {
        if (this.job && this.job.running) {
            this.job.stop();
        }
        this.job = new cron.CronJob({
            cronTime: this.cronTab,
            onTick: () => {
                this.task().catch(err => logger_1.Log.error(this.app, err));
            }
        });
    }
    /**
     * Set a crontab for the job
     */
    cron(cronTab) {
        this.cronTab = cronTab;
        this.resetCronJob();
    }
    /**
     * Get job instance
     */
    getJob() {
        if (!this.job) {
            throw new error_1.Error('No cron job was initialized');
        }
        return this.job;
    }
}
exports.Schedule = Schedule;
/**
 * Scheduler class
 */
class Scheduler {
    /**
     * Scheduler constructor
     */
    constructor(app) {
        this.app = app;
        /**
         * Default group name
         */
        this.groupName = 'default';
        /**
         * Grouping of schedules
         */
        this.calendar = {};
        this.calendar[this.groupName] = [];
    }
    /**
     * Schedules under the closure will saved to the given group name
     */
    group(name, closure) {
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
    command(command, params) {
        params = Array.isArray(params) ? params : [];
        params.unshift(command);
        let schedule = new Schedule(this.app, () => tslib_1.__awaiter(this, void 0, void 0, function* () { return app_2.Console.execute(params); }));
        this.calendar[this.groupName].push(schedule);
        return schedule;
    }
    /**
     * Get scheduled jobs
     */
    getSchedules(groupName) {
        if (!groupName) {
            let schedules = [];
            for (let groupName in this.calendar) {
                schedules = schedules.concat(this.calendar[groupName]);
            }
            return schedules;
        }
        return this.calendar[groupName];
    }
}
exports.Scheduler = Scheduler;
/**
 * Starter of scheduled jobs
 */
class ScheduledJobRunner {
    /**
     * ScheduledJobRunner constructor
     */
    constructor(scheduler) {
        this.scheduler = scheduler;
    }
    /**
     * Run scheduled jobs
     */
    run(groupName) {
        let schedules = this.scheduler.getSchedules(groupName);
        schedules.forEach(schedule => schedule.getJob().start());
    }
}
exports.ScheduledJobRunner = ScheduledJobRunner;
/**
 * Provide scheduled commands
 */
function provideScheduler(schedulesModule) {
    return (app) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        app_1.checkAppConfig(app);
        app_2.Console.addCommand(app, {
            command: 'schedule:run',
            desc: 'evaluate your scheduled tasks and runs the tasks that are due.',
            params: {
                group: {
                    required: false
                }
            },
            handler(argv) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    let schedules = require(schedulesModule || `${app.bootDir}/schedules`);
                    if (typeof schedules != 'object') {
                        throw new error_1.Error('Invalid schedules file');
                    }
                    if (typeof schedules.setup != 'function') {
                        throw new error_1.Error('schedules file should be setup function');
                    }
                    let scheduler = new Scheduler(app);
                    schedules.setup(scheduler);
                    new ScheduledJobRunner(scheduler).run(argv.group);
                    return false;
                });
            }
        });
    });
}
exports.provideScheduler = provideScheduler;
//# sourceMappingURL=scheduler.js.map