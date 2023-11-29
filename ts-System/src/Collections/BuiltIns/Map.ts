import { Dictionary, Dictionary_create, Dictionary_toMap } from "../Dictionary";
import { MapLike, MutableMapLike } from "./MapLike";
import { Selector } from "../../Data/Function/Selector";
import { value_t } from "../../Types/Primitive";

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

/** Reverses a map. Restricted to primitive types to remind you that {@link Map}s use the built-in equality operator. */
export function Map_reverse<A extends value_t, B extends value_t>(
    self: ReadonlyMap<A, B>
): Map<B, A> {
    const backwardMap = new Map<B, A>();
    for (const [k, v] of self) {
        backwardMap.set(v, k);
    }
    return backwardMap;
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
    const result = Dictionary_create<V>();
    for (const [key, value] of self) {
        result[key] = value;
    }
    return result;
}

/** @deprecated Move to Record_* */
export const Map_fromDictionary = Dictionary_toMap
