import { AssertionFunction, requires } from "../Assert";
import { identity } from "../Data/Function";

/** 
 * For regular use, TS 4.9 lets you use the `satisfies` operator directly. 
 * For creating pseudo-factory functions, this function is still appropriate. 
 */
export const satisfiesWeakly: 
    <T>() => <U extends T>(x: U) => U 
=      () => identity;

/**
 * Type-level equivalent of the value-level `satisfies` operator.
 * 
 * NB: The argument order now matches the operator.
 */
export type Satisfies<U extends T, T> = U;

/*
TODO: What to call this; it has elements of:
- satisfy
- satisfies
- assert
- requires
- factory
- create
*/

export interface TypeChecker<T, U extends T> {
    (candidate: T): U;
    [Symbol.hasInstance](candidate: T): candidate is U;
}

// Is used by Path, so kinda important ^^
export function createChecker<T, U extends T>(
    check: (x: T) => x is U,
    assertionFunction: AssertionFunction = requires,
): TypeChecker<T, U> {
    const checker = (candidate: T) => {
        assertionFunction(check(candidate));
        return candidate;
    }
    const instanceOf = (candidate: T) => check(candidate);
    
    Object.defineProperty(checker, Symbol.hasInstance, { value: instanceOf });
    return checker as TypeChecker<T, U>;
}

export const satisfiesStrictly = createChecker;
