import { getConstructorName } from "../Data/Constructor";
import { Exception } from "../Assert";
import { terminal } from "../Logging/Terminal";

// Alright Here's the hard part
// Exceptions go through the same channel as eerrors, even when exceptions shouldn't get a stack trace.
// Returned errors perhaps?

export type Throwable = unknown;

export function throwableToError(throwable: Throwable): Error {
    if (throwable instanceof Error) {
        return throwable
    } else {
        const message = `Expected Error, received ${getConstructorName(throwable)} (${throwable})`;
        return new TypeError(message, { cause: throwable });
    }
}

/** Formats a thrown value appropriately, i.e. bugs get a stack trace, but exceptions only display the message. */
export function formatThrowable(error: Throwable): string {
    return (
        // Exceptions and subclasses
        (error instanceof Exception && error.message) ||
        // All other Errors
        (error instanceof Error && error.stack) ||
        // Things that are not errors 
        String(error)
    );
}

/** Prints a thrown value appropriately, i.e. bugs get a stack trace, but exceptions only display the message. */
export function printThrowable(error: Throwable): void {
    terminal.error(formatThrowable(error));
}

/** @deprecated Use {@link printThrowable} instead. */
export const printError = printThrowable;
