import {Dictionary, Dictionary_toMap} from "./Dictionary";
import {deprecatedAlias} from "../../../Deprecated";
import {Selector} from "../../../Types/Function";

export interface MapLike<K, V> {
    has(key: K): boolean;
    get(key: K): V | undefined;
}

export interface MutableMapLike<K, V>
extends MapLike<K, V> {
    set(key: K, value: V): void;
}

/** noot noot */
export function Map_map<K, V, W>(
    self: ReadonlyMap<K, V>,
    func: (value: V, key: K) => W,
): Map<K, W> {
    const result = new Map<K, W>();
    for (const [k, v] of self) {
        result.set(k, func(v, k));
    }
    return result;
}

/** Reverses a map. */
export function Map_reverse<A, B>(self: ReadonlyMap<A, B>): Map<B, A> {
    const backward = new Map<B, A>();
    for (const [k, v] of self) {
        backward.set(v, k);
    }
    return backward;
}

export function Map_hasAny<K>(
    self: MapLike<K, unknown>, 
    key: unknown,
): key is K {
    return self.has(key as any);
}

// Wtf is this?
export function Map_update<K, V>(
    map: MutableMapLike<K, V>, 
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
    self: MutableMapLike<K, number>, 
    key: K,
): void {
    self.set(key, (self.get(key) ?? 0) + 1);
}

export function Map_toDictionary<K extends string, V>(
    self: ReadonlyMap<K, V>,
): Dictionary<V> {
    const result = Dictionary<V>();
    for (const [key, value] of self) {
        result[key] = value;
    }
    return result;
}

/** @deprecated Move to Record_* */
export const Map_fromDictionary = deprecatedAlias("Map_fromDictionary", 
    Dictionary_toMap,
);

/** 
 * Returns the value associated with the given key.
 * If that value is missing, 
 * computes it using the key and stores the result.
 */
export function Map_computeIfAbsent<K, V>(
    self: Map<K, V>,
    key: K,
    compute: (key: K) => V
): V {
    if (self.has(key)) {
        return self.get(key)!;
    } else {
        const value = compute(key);
        self.set(key, value);
        return value;
    }
}
