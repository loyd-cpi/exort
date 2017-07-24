/**
 * Base ErrorHandler class
 */
export abstract class ErrorHandler {

  /**
   * Abstract report method
   */
  public abstract async report(error: Error): Promise<void>;
}
