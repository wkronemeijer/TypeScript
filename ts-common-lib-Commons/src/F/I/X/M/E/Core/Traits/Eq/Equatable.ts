import { isErrorNumber, isFunction, isObject } from "../../IsX";
import { value_t } from "../../Types/Primitive";

//////////////////////
// EqualityComparer //
//////////////////////

export type EqualityComparer<T> = (a: T, b: T) => boolean;

/////////////////////
// EquatableObject //
/////////////////////

export interface EquatableObject {
    /**
     * Check if two objects are equal to eachother.
     *
     * Note that {@link equals} will never compare objects
     * if they do not share the same `equals` method.
     */
    equals(other: this): boolean;
}

function isEquatableObject(value: unknown): value is EquatableObject {
    return (
        isObject(value) &&
        ("equals" satisfies keyof EquatableObject) in value &&
        isFunction(value.equals) &&
        value.equals.length === 1
    );
}

// TODO: Add @@equals method

///////////////
// Equatable //
///////////////

export type Equatable = 
    | value_t 
    | EquatableObject
;

///////////////////
// Object equals //
///////////////////

function equalsObject(lhs: object, rhs: object): boolean {
    if (
        isEquatableObject(lhs) && 
        isEquatableObject(rhs) &&
        lhs.equals === rhs.equals
    ) {
        return Boolean(lhs.equals(rhs));
    } else {
        return lhs === rhs; 
    }
}

////////////////////
// Generic equals //
////////////////////

/** 
 * Checks any two values for equality, using the SameValueZero method. 
 * Invokes {@link EquatableObject} when appropriate. 
 */
export function equalsAny(a: unknown, b: unknown): boolean {
    return (
        (
            a === b
        ) || (
            isErrorNumber(a) && 
            isErrorNumber(b)
        ) || (
            isObject(a) &&
            isObject(b) &&
            equalsObject(a, b)
        )
    );
}

/** 
 * Checks two values for equality, using the SameValueZero method. 
 * Invokes {@link EquatableObject} when appropriate. 
 * 
 * To compare two values of any type, use {@link equalsAny}. 
 */
export const equals: 
    <T extends Equatable>(a: T, b: T) => boolean 
= equalsAny;
