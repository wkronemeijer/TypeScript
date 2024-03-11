import { alwaysUndefined, constant } from "../Function/Common";
import { keyof_t } from "../../Types/Primitive";
import { panic } from "../../Errors/Panic";

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
 * Given a dictionary that contains a list of values for each determinant, provides the reverse operation.
*/
// TODO: Feels like it needs more support to do what it does. 
export function Record_toDeterminer<V, K extends string>(
    record: Record<K, Iterable<V>>,
): (x: V) => K | undefined {
    const map = new Map<V, K>();
    
    for (const [group, instances] of Object.entries<Iterable<V>>(record)) {
        for (const instance of instances) {
            if (map.has(instance)) {
                panic(`Duplicate detected: '${instance}'.`);
            }
            
            map.set(instance, group as K);
        }
    }
    
    return x => map.get(x);
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
