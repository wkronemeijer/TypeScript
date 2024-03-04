import { defineProperty } from "../../ReExport/Module/Object";
import { Newtype } from "../Nominal/Newtype";
import { value_t } from "../../Types/Primitive";

/** The identity function. */
export const identity = <T>(x: T) => x;

/** The constant function. */
export const constant = <T>(x: T) => <U>(_?: U) => x;

/** Constant &top; function. */
export const alwaysTrue = constant(true);

/** Constant &bot; function. */
export const alwaysFalse = constant(false);

export function negate<T>(
    predicate: (value: T) => unknown,
):             (value: T) => boolean {
    return value => !predicate(value);
}

/** 
 * Placeholder function which does nothing. 
 * Useful as a default for functions that return `void`. 
 */
export function pass(..._: unknown[]): void {
    // Placeholder function for functions where 
    // the primary purpose is a side effect.
    // (() => {})
    // 1234567890 == 10 chars
    // ideally we have a shorter name...
}

/*
Note on name:

($)               : (a -> b) -> a -> b
(&) = reverse ($) : a -> (a -> b) -> b

We have curried (&) here, how to call it?


*/
/** Applies a function in reverse. `reverse "apply"` if you will. */
export function ylppa<
    F extends (...args: any[]) => any
>(...args: Parameters<F>): (func: F) => ReturnType<F> {
    return func => func(...args);
}

export function createFactory<F extends new (...args: any[]) => any>(
    constructor: F
): (...args: ConstructorParameters<F>) => InstanceType<F> {
    return (...args) => new constructor(...args);
}

/** **WARNING**: the prototype of both arguments will be overriden! Make sure to provide fresh/local arguments. */
export function Function_includeProperties<F extends Function, O extends object>(func: F, prototype: O): F & O {
    const originalPrototype = Object.getPrototypeOf(func);
    Object.setPrototypeOf(prototype, originalPrototype);
    Object.setPrototypeOf(func, prototype);
    return func as F & O;
}

/////////////////
// Memoization //
/////////////////

export function Function_precompute<T extends value_t, R>(
    possibleInputs: Iterable<T>,
    expensiveFunction: (x: T) => R,
): typeof expensiveFunction {
    const cache = new Map<T, R>;
    for (const input of possibleInputs) {
        cache.set(input, expensiveFunction(input));
    }
    return x => cache.get(x)!;
}

const MemoizationKey_seperator = '\x1F'; 
// ASCII Unit Seperator 
// ...which is unlikely to show up in most values.

type     MemoizationKey = Newtype<string, "MemoizationKey">;
function MemoizationKey(parts: readonly value_t[]): MemoizationKey {
    return parts.join(MemoizationKey_seperator) as MemoizationKey;
}

export function Function_memoize<P extends readonly value_t[], R>(
    expensiveFunc: (...params: P) => R
):        (...params: P) => R {
    const cache = new Map<MemoizationKey, R>;
    return (...args): R => {
        const key = MemoizationKey(args);
        let result: R;
        if (cache.has(key)) {
            result = cache.get(key)!;
        } else {
            const value = expensiveFunc(...args);
            cache.set(key, value);
            result = value;
        }
        return result;
    };
}

export const flip = <T, U>(array: readonly [T, U]): readonly [U, T] => [array[1], array[0]];

/** Sets the name of a function using [[DefineOwnProperty]]. */
export function Function_setName(func: Function, name: string): void {
    defineProperty(func, "name" satisfies keyof Function, {
        configurable: true,
        enumerable: false,
        writable: false,
        value: name,
    });
}
