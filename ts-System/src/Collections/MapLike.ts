
export interface MapLike<K, V> {
    has(key: K): boolean;
    get(key: K): V | undefined;
}

export interface MutableMapLike<K, V>
    extends MapLike<K, V> {
    set(key: K, value: V): void;
}
