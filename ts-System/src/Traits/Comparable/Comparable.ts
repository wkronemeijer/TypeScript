import { FunctionalInterface_createTypeGuard } from "../../Types/FunctionalInterface";
import { Ordering } from "./Ordering";
import { value_t } from "../../Types/Primitive";

/** Makes an object {@link Comparable}. */
export interface ComparableObject {
    /** 
     * Compares this and the given object.  
     * 
     * The global `compare` function compares two objects using this function,
     * but only if they share the same function.
     */
    compare(other: this): Ordering;
}

export const ComparableObject_hasInstance = FunctionalInterface_createTypeGuard("compare")<ComparableObject>(1);

/** 
 * All values that are explicitly comparable. 
 * Objects must implement {@link ComparableObject}.
 */
export type Comparable = 
    | value_t
    | ComparableObject
    // | Function 
    // Skipped to prevent accidently not applying functions
    // You can always use compareAny directly
;
