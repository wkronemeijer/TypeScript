/** Callable similar to `console.log`. */
export interface LoggingFunction {
    /** Logs the given value and appends a newline. */
    (value?: unknown): void;
}
