import { value_t } from "../../Types/Primitive";

///////////////
// Equatable //
///////////////

export interface EquatableObject {
    /**
     * Check if two objects are equal to eachother.
     *
     * Note that {@link equals} will never compare objects
     * if they do not share the same `equals` method.
     */
    equals(other: this): boolean;
}

const methodName = "equals" satisfies keyof EquatableObject;

export function EquatableObject_hasInstance(object: unknown): object is EquatableObject {
    return (
        typeof object === "object"               &&
        object !== null                          &&
        methodName in object                     &&
        typeof object[methodName] === "function" && 
        object[methodName].length === 1
    );
}

export type Equatable = 
    | value_t 
    | EquatableObject
;
