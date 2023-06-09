import { panic } from "../Errors/ErrorFunctions";
import { keyof_t } from "../Types/KeyOf";

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
export function Record_toTotalFunction<K extends keyof_t, V>(
    self: Partial<Record<K, V>>, 
    default_: V,
): (x: K) => V {
    return x => x in self ? self[x]! : default_;
}

/** 
 * Turns a partial record into a partial function. 
 * Missing cases default to undefined. 
 */
export function Record_toPartialFunction<K extends keyof_t, V>(
    self: Partial<Record<K, V>>,
): (x: K) => V | undefined {
    // Replacing this with Record_toFunction gets messy type wise:
    // duplicating it is simpler.
    return Record_toTotalFunction(self, undefined);
}

////////////////////
// Record --> Map //
////////////////////
