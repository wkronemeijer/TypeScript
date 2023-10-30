import { constant } from "../Data/Function";
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
): (value: K) => V {
    return x => self[x];
}

/** 
 * Turns a partial record into a partial function. 
 * Missing cases default to given default. 
 * 
 * Consider using {@link constant} for simple values.
 */
export function PartialRecord_toTotalFunction<K extends keyof_t, V>(
    self: Partial<Record<K, V>>, 
    getDefault: (key: K) => V,
): (value: K) => V {
    return x => x in self ? self[x]! : getDefault(x);
}

const alwaysUndefined = constant(undefined);

/** 
 * Turns a partial record into a partial function. 
 * Missing cases default to undefined. 
 */
export function PartialRecord_toPartialFunction<K extends keyof_t, V>(
    self: Partial<Record<K, V>>,
): (x: K) => V | undefined {
    // Replacing this with Record_toFunction gets messy type wise:
    // duplicating it is simpler.
    return PartialRecord_toTotalFunction(self, alwaysUndefined);
}
