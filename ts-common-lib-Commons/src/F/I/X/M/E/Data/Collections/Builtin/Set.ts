import {value_t} from "../../../Types/Primitive";
import {panic} from "../../../Errors/Panic";

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

/////////////////////
// Stage 3 methods //
/////////////////////

export function Set_union<T>(lhs: ReadonlySet<T>, rhs: ReadonlySet<T>): Set<T> {
    return new Set(function*() {
        yield* lhs;
        yield* rhs;
    }());
}

export function Set_intersection<T>(lhs: ReadonlySet<T>, rhs: ReadonlySet<T>): Set<T> {
    const result = new Set<T>;
    for (const item of lhs) {
        if (rhs.has(item)) {
            result.add(item);
        }
    }
    return result;
}
