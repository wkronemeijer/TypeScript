import { keyof_t } from "../Types/Primitive";

/////////////////////////
// Record --> Function //
/////////////////////////

/** 
 * Turns a record into a function. 
 * 
 * If you want to use a default value, use {@link Record_toTotalFunction}.
 */
export function Record_toFunction<K extends keyof_t, V>(
    self: Record<K, V>,
): (x: K) => V {
    return x => self[x];
}

/** 
 * Turns a partial record into a partial function. 
 * Missing cases default to given default. 
 */
export function PartialRecord_toTotalFunction<K extends keyof_t, V>(
    self: Partial<Record<K, V>>, 
    default_: V,
): (x: K) => V {
    return x => x in self ? self[x]! : default_;
}

/** 
 * Turns a partial record into a partial function. 
 * Missing cases default to undefined. 
 */
export function PartialRecord_toPartialFunction<K extends keyof_t, V>(
    self: Partial<Record<K, V>>,
): (x: K) => V | undefined {
    // Replacing this with Record_toFunction gets messy type wise:
    // duplicating it is simpler.
    return PartialRecord_toTotalFunction(self, undefined);
}

// TODO: Remove
/** @deprecated Use `PartialRecord_XXX`. */
export const Record_toTotalFunction = PartialRecord_toTotalFunction;
/** @deprecated Use `PartialRecord_XXX`. */
export const Record_toPartialFunction = PartialRecord_toPartialFunction;
