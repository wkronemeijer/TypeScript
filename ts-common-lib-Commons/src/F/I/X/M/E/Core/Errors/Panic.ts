// there were a bunch of exceptions here, but almost all of those were programming errors
// i.e. stuff which shouldn't error at all.
// Now it is a load of functions which `throw new Error` in creative ways.

import {doOnce} from "../DoOnce";

/** Marks a function as abstract. */
export function abstract(): never {
    doOnce(abstract, () => {
        console.warn(`'abstract' is deprecated, use '__NOT_IMPLENTED' instead`);
    });
    throw new Error("This method is abstract.");
}

/** Throw an error. The only honorable option when no other course of action remains. */
export function panic(reason?: string): never {
    throw new Error(reason);
}

/** 
 * Similar {@link panic}, 
 * but for those cases where some variable has been narrowed to `never`.
 */
export function unreachable(impossible: never): never {
    throw new Error(`reached 'unreachable' branch for case '${impossible}'`);
}

/** @deprecated Use {@link unreachable} instead. */
export const neverPanic = unreachable;
