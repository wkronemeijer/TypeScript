export class MultiSet<T> implements Iterable<readonly [T, number]> {
    private readonly store: Map<T, number>;
    readonly size: number;
    
    constructor(iterable?: Iterable<readonly [T, number]>) {
        this.store = new Map(iterable);
        this.size  = this.store.size;
    }
    
    count(value: T): number {
        return this.store.get(value) ?? 0;
    }
    
    has(value: T): boolean {
        return this.count(value) > 0;
    }
        
    add(value: T): this {
        this.store.set(value, this.count(value) + 1);
        return this;
    }
    
    clear(): void {
        this.store.clear();
    }
    
    delete(value: T): boolean {
        return this.store.delete(value);
    }
    
    entries(): IterableIterator<readonly [T, number]> {
        return this.store.entries();
    }
    
    values(): IterableIterator<T> {
        return this.store.keys();
    }
    
    [Symbol.iterator](): IterableIterator<readonly [T, number]> {
        return this.entries();
    }
    
    getTotalCount(): number {
        return (
            Array.from(this.store.entries())
            .map(([_, b]) => b)
            .reduce((a, b) => a + b, 0)
        );
    }
}
