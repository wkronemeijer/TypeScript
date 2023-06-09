import { primitive_t } from "../Types/Primitive";
import { keyof_t } from "../Types/KeyOf";
import { Selector } from "./Sequence";
import { Dictionary, Dictionary_create, Dictionary_toMap } from "./Dictionary";

/** noot noot */
export function Map_map<K, V, W>(
    map: ReadonlyMap<K, V>,
    func: (value: V, key: K) => W,
): Map<K, W> {
    const result = new Map<K, W>();
    for (const [k, v] of map) {
        result.set(k, func(v, k));
    }
    return result;
}

/** 
 * Converts a partial dictionary into a map. 
 * @deprecated Move to Record_*
 */
export function Map_fromPartialDictionary<K extends keyof_t, V>(
    dictionary: Partial<Record<K, V>>,
): Map<K, V | undefined> {
    const result = new Map<K, V | undefined>();
    for (const key in dictionary) {
        const value = dictionary[key];
        result.set(key, value);
    }
    return result;
}

/** Converts a tuple into a map, using the provided default value. Useful for toggles for each enum value, for instance. */
export function Map_associateWith<K extends primitive_t, V>(
    array: readonly K[], 
    valueSelector: (member: K) => V,
): Map<K, V> {
    const result = new Map<K, V>();
    for (const key of array) {
        result.set(key, valueSelector(key));
    }
    return result;
}

export function Map_associateBy<K extends primitive_t, V>(
    array: readonly V[], 
    keySelector: (member: V) => K,
): Map<K, V> {
    const result = new Map<K, V>();
    for (const value of array) {
        result.set(keySelector(value), value);
    }
    return result;
}

/** Reverses a map. Restricted to primitive types to remind you that {@link Map}s use the built-in equality operator. */
export function Map_reverse<A extends primitive_t, B extends primitive_t>(
    self: ReadonlyMap<A, B>
): Map<B, A> {
    const backwardMap = new Map<B, A>();
    for (const [k, v] of self) {
        backwardMap.set(v, k);
    }
    return backwardMap;
}

export function Map_hasAny<K extends primitive_t>(
    self: ReadonlyMap<K, unknown>, 
    value: unknown,
): value is K {
    return self.has(value as any);
}

// Wtf is this?
export function Map_update<K, V>(
    map: Map<K, V>, 
    key: K, 
    initializer: Selector<K, V>, 
    update: Selector<V, V>
): void {
    if (!map.has(key)) {
        map.set(key, initializer(key));
    }
    map.set(key, update(map.get(key)!));
}

export function Map_increment<K>(
    self: Map<K, number>,
    key: K,
): void {
    self.set(key, (self.get(key) ?? 0) + 1);
}

export function Map_toDictionary<K extends string, V>(
    self: ReadonlyMap<K, V>,
): Dictionary<V> {
    const result = Dictionary_create<V>();
    for (const [key, value] of self) {
        result[key] = value;
    }
    return result;
}

/** @deprecated Move to Record_* */
export const Map_fromDictionary = Dictionary_toMap
