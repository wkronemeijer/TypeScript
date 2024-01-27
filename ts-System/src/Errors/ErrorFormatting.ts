import { Exception } from "../Assert";
import { terminal } from "../Logging/Terminal";

export type Throwable = unknown;

/** Formats a thrown value appropriately, i.e. bugs get a stack trace, but exceptions only display the message. */
export function formatThrowable(error: Throwable) {
    return (
        // Exceptions and subclasses
        (error instanceof Exception) ? error.message :
        // All other Errors
        (error instanceof Error) ? error.stack :
        // Things that are not errors 
        `Error: ${String(error)}`
    );
}

/** Prints a thrown value appropriately, i.e. bugs get a stack trace, but exceptions only display the message. */
export function printThrowable(error: Throwable): void {
    terminal.error(formatThrowable(error));
}

/** @deprecated Use {@link printThrowable} instead. */
export const printError = printThrowable;
