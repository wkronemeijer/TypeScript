import { AssertionFunction } from "./Errors/Assert";

// Goal: Distinguishing between bugs and recoverable errors (= exceptions).
// from http://joeduffyblog.com/2016/02/07/the-error-model/#bugs-arent-recoverable-errors
// Really frustrating that JavaScript calls its exceptions "Error"s...

/** Recoverable error. Intended to be displayed **without** the stack.*/
export class Exception extends Error {
    protected readonly __isException = true;
}

/** Assertion function for recoverable errors. */
export const guard: AssertionFunction = AssertionFunction(Exception, "Guard failed.");

/** Throw an exception. The only honorable option when no other course of action remains. */
export function mildPanic(reason?: string): never {
    throw new Exception(reason);
}
