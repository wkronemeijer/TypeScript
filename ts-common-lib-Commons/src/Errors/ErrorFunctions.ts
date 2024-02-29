// there were a bunch of exceptions here, but almost all of those were programming errors
// i.e. stuff which shouldn't error at all.
// Now it is a load of functions which `throw new Error` in creative ways.

import { Exception } from "../Assert";

/** Marks a function as no longer supported. */
export function deprecated(): never {
    throw new Error("This method is no longer supported.");
}

/** Marks a function as abstract. */
export function abstract(): never {
    throw new Error("This method is abstract.");
}

/** Throw an error. The only honorable option when no other course of action remains. */
export function panic(reason?: string): never {
    throw new Error(reason);
}

/** Throw an exception. The only honorable option when no other course of action remains. */
export function mildPanic(reason?: string): never {
    throw new Exception(reason);
}

/** Just like `panic`, except for those cases where some variable has been narrowed to `never`. */
export function neverPanic(missingCase: never): never {
    throw new Error(`Missing a case for '${missingCase}'.`);
}
