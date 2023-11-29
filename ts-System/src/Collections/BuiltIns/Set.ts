import { value_t } from "../../Types/Primitive";
import { panic } from "../../Errors/ErrorFunctions";

////////////////
// Cached set //
////////////////

const setCache = new WeakMap<ReadonlyArray<any>, ReadonlySet<any>>();

/**
 * 
 * NB: Should only be called on immutable arrays.
 */
export function Set_getCachedSet<T>(array: readonly T[]): ReadonlySet<T> {
    if (!setCache.has(array)) {
        setCache.set(array, new Set(array));
    }
    return setCache.get(array) ?? panic();
}

//////////////////////
// Determiner (???) //
//////////////////////

/** 
 * Given a dictionary that contains a list of values for each determinant, provides the reverse operation.
 * @deprecated Feels like it needs more support to do what it does. 
 */
export function Set_createDeterminer<V, K extends string>(
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

export function Set_hasAny<T extends value_t>(set: ReadonlySet<T>, value: unknown): value is T {
    return set.has(value as any);
}


export function Set_overlapsWith<T>(set: ReadonlySet<T>, iterable: Iterable<T>): boolean {
    for (const item of iterable) {
        if (set.has(item)) {
            return true;
        }
    }
    return false;
}

export function Set_isEmpty(set: ReadonlySet<unknown>): boolean {
       return set.size === 0;
}

export function Set_isNotEmpty(set: ReadonlySet<unknown>): boolean {
    return set.size !== 0;
}

/** 
 * Tries to remove one element from the start of the set. 
 * Returns undefined if the set is empty.
 */
export function Set_dequeue<T>(self: Set<T>): T | undefined {
    const firstResult = self[Symbol.iterator]().next();
    if (!firstResult.done) {
        const firstValue = firstResult.value;
        self.delete(firstValue);
        return firstValue;
    }
}

export function Set_toTypeGuard<T extends value_t>(self: ReadonlySet<T>): (item: unknown) => item is T {
    return (item: unknown): item is T => Set_hasAny(self, item);
}

export const Set_toFunction: <T extends value_t>(self: ReadonlySet<T>) => (item: T) => boolean = Set_toTypeGuard;
