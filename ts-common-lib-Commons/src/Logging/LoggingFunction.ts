/** Callable similar to `console.log`. */
export interface LoggingFunction {
    // TODO: Allow unknown[] like console.log
    /** Logs the given value and appends a newline. */
    (value?: unknown): void;
}
