import { requires } from "./Assert";
import { Newtype } from "./Types/Newtype";
import { primitive_t } from "./Types/Primitive";

/** The identity function. */
export const identity = <T>(x: T) => x;

/** The constant function. */
export const constant = <T>(x: T) => <U>(_: U) => x;

/** Constant &top; function. */
export const alwaysTrue = constant(true);

/** Constant &bot; function. */
export const alwaysFalse = constant(false);

/** Selects the first element of a tuple. */
export const fst = <T>(array: readonly [T, ...any[]]): T => array[0];
/** Selects the second element of a tuple. */
export const snd = <T>(array: readonly [unknown, T, ...any[]]): T => array[1];

export const flip = <T, U>(array: readonly [T, U]): readonly [U, T] => [array[1], array[0]];

export function negate<T>(
    predicate: (value: T) => unknown,
):             (value: T) => boolean {
    return value => !predicate(value);
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

export function Function_precompute<T extends primitive_t, R>(
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
function MemoizationKey(parts: readonly primitive_t[]): MemoizationKey {
    return parts.join(MemoizationKey_seperator) as MemoizationKey;
}

export function Function_memoize<P extends readonly primitive_t[], R>(
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
