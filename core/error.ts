import { KeyValuePair } from './misc';
import { Application } from './app';
import { Context } from './service';

/**
 * Base ErrorHandler class
 */
export abstract class ErrorHandler {

  /**
   * ErrorHandler constructor
   */
  constructor(protected readonly app: Application, protected readonly context: Context) {}

  /**
   * Abstract report method
   */
  public abstract async report(error: Error): Promise<void>;
}

/**
 * Error class
 */
export class Error extends global.Error {

  /**
   * Error constructor
   */
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * toJSON method
   */
  public toJSON(): KeyValuePair {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack
    };
  }
}
