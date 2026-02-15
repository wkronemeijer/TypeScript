import { identity } from "./Common";

///////////
// Thunk //
///////////

export type  Thunk<T> = () => T;
export const Thunk: <T>(thunk: () => T) => Thunk<T> = identity;

export function Thunk_hasInstance(value: unknown): value is Thunk<unknown> {
    return typeof value === "function";
}

//////////////
// Deferred //
//////////////

// type Lazy<T> = T | Thunk<T>;
// Lazy is cached --> innappropriate name
// Lazy is also run once...thunks can be run multiple times.

/** 
 * A value or a means to compute one. 
 * 
 * Does not work with curried functions.
 * It is complicated to add that restriction to the type.
 */
export type Deferred<T> = // T extends (...args: any[]) => any ? never : 
    | T
    | Thunk<T>
;

export function Deferred_normalize<T>(deferred: Deferred<T>): Thunk<T> {
    if (Thunk_hasInstance(deferred)) {
        return deferred;
    } else {
        return () => deferred;
    }
}

export const undefer = Deferred_normalize;
