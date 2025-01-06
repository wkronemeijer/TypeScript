import {getConstructorName} from "../Data/Names/GetConstructorName";
import {deprecatedAlias} from "../Deprecated";
import {Exception} from "../Exception";

// Alright Here's the hard part
// Exceptions go through the same channel as errors, even when exceptions shouldn't get a stack trace.
// Returned errors perhaps?

export type Throwable = unknown;

export function throwableToError(cause: Throwable): Error {
    if (cause instanceof Error) {
        return cause;
    } else {
        const name = getConstructorName(cause);
        const message = `expected Error, received ${name} (${cause})`;
        return new TypeError(message, {cause});
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
    console.error(formatThrowable(error));
}

/** @deprecated Use {@link printThrowable} instead. */
export const printError = deprecatedAlias("printError", printThrowable);
