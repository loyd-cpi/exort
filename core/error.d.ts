/**
 * Base ErrorHandler class
 */
export declare abstract class ErrorHandler {
    /**
     * Abstract report method
     */
    abstract report(error: Error): Promise<void>;
}
