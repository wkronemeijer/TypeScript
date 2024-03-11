import { Throwable, formatThrowable } from "../Core/Debug/ErrorFormatting";
import { terminal } from "./Logging/Terminal";

/** Prints a thrown value appropriately, i.e. bugs get a stack trace, but exceptions only display the message. */
export function printThrowable(error: Throwable): void {
    terminal.error(formatThrowable(error));
}

/** @deprecated Use {@link printThrowable} instead. */
export const printError = printThrowable;
