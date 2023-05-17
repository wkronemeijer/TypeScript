export class PersistentMap<K, V> 
implements ReadonlyMap<K, V> {
    readonly size: number;
    
    private constructor(
        private readonly store: ReadonlyMap<K, V>
    ) {
        this.size = this.store.size;
    }
    
    private cloneStore(): Map<K, V> {
        return new Map(this.store);
    }
    
    /////////////////////////
    // ReadonlyMap methods //
    /////////////////////////
    
    get(key: K): V | undefined {
        return this.store.get(key);
    }
    
    has(key: K): boolean {
        return this.store.has(key);
    }
    
    entries(): IterableIterator<[K, V]> { return this.store.entries() }
    keys()   : IterableIterator<K>      { return this.store.keys()    }
    values() : IterableIterator<V>      { return this.store.values()  }
    
    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.store[Symbol.iterator]();
    }
        
    // this is very ugly, lol wat?
    forEach(callbackfn: (value: V, key: K, Map: ReadonlyMap<K, V>) => void, thisArg?: any): void {
        return this.store.forEach(callbackfn, thisArg);
    }
    
    /////////////////
    // Map methods //
    /////////////////
    
    set(key: K, value: V): PersistentMap<K, V> {
        const newStore = this.cloneStore();
        newStore.set(key, value);
        return new PersistentMap(newStore);
    }
    
    delete(key: K): PersistentMap<K, V> {
        if (this.has(key)) {
            const newStore = this.cloneStore();
            newStore.delete(key);
            return new PersistentMap(newStore);
        } else return this;
    }
    
    clear(): PersistentMap<K, V> {
        if (this.size > 0) {
            return PersistentMap.default;
        } else return this;
    }
    
    static empty<K, V>(): PersistentMap<K, V> {
        return new PersistentMap<K, V>(new Map);
    }
    
    static from<K, V>(iterable: Iterable<readonly [K, V]>): PersistentMap<K, V> {
        return new PersistentMap(new Map(iterable));
    }

    static of<K, V>(...elements: readonly (readonly [K, V])[]): PersistentMap<K, V> {
        return this.from(elements);
    }
    
    static readonly default = this.empty<any, any>();
}
