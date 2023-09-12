import { Equatable, EquatableObject, EquatableObject_hasInstance } from "./Equatable";

///////////////////
// Object equals //
///////////////////

const isEquatableObject = EquatableObject_hasInstance

function equalsObject(lhs: object, rhs: object): boolean {
    if (
        isEquatableObject(lhs) && 
        isEquatableObject(rhs) &&
        lhs.equals === rhs.equals
    ) {
        return Boolean(lhs.equals(rhs));
        // TODO: Why do we cast it to Boolean? Should it not already be boolean?
    } else {
        return lhs === rhs; 
    }
}

////////////////////
// Generic equals //
////////////////////

// Confusing, but better for performance
const isNaN = Number.isNaN;

function isObject(object: unknown): object is object {
    return (
        typeof object === "object" && 
        object !== null
    );
}

/** 
 * Checks any two values for equality, using the SameValueZero method. 
 * Invokes {@link EquatableObject} when appropriate. 
 */
export function equalsAny(a: unknown, b: unknown): boolean {
    return (
        (
            a === b
        ) || (
            isNaN(a) && 
            isNaN(b)
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
