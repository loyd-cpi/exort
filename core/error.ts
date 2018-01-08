import { KeyValuePair } from './misc';

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
