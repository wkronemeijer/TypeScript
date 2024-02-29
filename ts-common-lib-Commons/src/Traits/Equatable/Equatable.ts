import { FunctionalInterface_createTypeGuard } from "../../Types/FunctionalInterface";
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

export const EquatableObject_hasInstance = FunctionalInterface_createTypeGuard("equals")<EquatableObject>(1);

export type Equatable = 
    | value_t 
    | EquatableObject
;
