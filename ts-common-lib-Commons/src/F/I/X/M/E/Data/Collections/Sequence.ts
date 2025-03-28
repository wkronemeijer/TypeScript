import {Comparer, compare, compareAny} from "../../Traits/Ord/Comparable";
import {FstAny, SndAny, fst, snd} from "../Tuple";
import {Predicate, Selector} from "../../Types/Function";
import {Array_shuffle} from "./Builtin/Array";
import {Comparable} from "../../Traits/Ord/Comparable";
import {Dictionary} from "./Builtin/Dictionary";
import {identity} from "../Function/Common";
import {Truthy} from "../../Types/Truthy";

export interface Sequence<T> extends Iterable<T> {
    /////////////////////////
    // Expanding sequences //
    /////////////////////////
    
    append(element: T): Sequence<T>;
    concat<U>(that: Iterable<U>): Sequence<T | U>;
    zip<U>(other: Iterable<U>): Sequence<[T, U]>;
    
    /////////////////////////////
    // Standard fold functions //
    /////////////////////////////
    
    select<U>(selector: Selector<T, U>): Sequence<U>;
    selectMany<U>(selector: Selector<T, Iterable<U>>): Sequence<U>;
    where(filter: Predicate<T>): Sequence<T>;
    selectWhere<U>(selectorPredicate: Selector<T, U>): Sequence<Truthy<U>>;
    distinct(): Sequence<T>;
    reverse(): Sequence<T>;
    
    groupBy<G>(representativeSelector: Selector<T, G>): Sequence<[G, T[]]>;
    
    ///////////
    // Pairs // 
    ///////////
    
    associate<K, V>(
        keySelector: Selector<T, K>, 
        valueSelector: Selector<T, V>,
    ): Sequence<[K, V]>;
    
    associateBy<K>(keySelector: Selector<T, K>): Sequence<[K, T]>;
    associateWith<V>(valueSelector: Selector<T, V>): Sequence<[T, V]>;
    
    ///////////
    // Sorts //
    ///////////
    
    orderBy(comparer: Comparer<T>): Sequence<T> ;
    
    orderOn<U extends Comparable>(
        selector: Selector<T, U>,
        comparer?: Comparer<U>,
    ): Sequence<T>;
    
    ordered(): Sequence<T>;
    
    //////////////////////
    // Modify sequences //
    //////////////////////
    
    take(n: number): Sequence<T>;
    
    skip(n: number): Sequence<T>;
    
    skipWhile(predicate: Predicate<T>): Sequence<T>;
    takeWhile(predicate: Predicate<T>): Sequence<T>;
    
    shuffle(): Sequence<T>;
    
    /////////////////////////
    // To-other-collection //
    /////////////////////////
    
    toArray(): T[];
    
    // Thanks to TS 4.X you can provide type hints without actually invoking a function. 
    // Making this pseudo """higher kinded type higher order function""" possible.
    to<C extends new (iterable: Iterable<T>) => any>(constructor: C): InstanceType<C>;
    
    toSet(): Set<T>;
    
    
    toMap(): Map<FstAny<T>, SndAny<T>>;
    toMap<K, V>(
        keySelector: Selector<T, K>, 
        valueSelector: Selector<T, V>,
    ): Map<K, V>;
    
    toMapBy<K>(
        keySelector: Selector<T, K>, 
    ): Map<K, T>;
    
    toMapWith<V>(
        valueSelector: Selector<T, V>,
    ): Map<T, V>;
    
    toDictionary<V>(
        keySelector: Selector<T, string>, 
        valueSelector: Selector<T, V>,
    ): Dictionary<V>;
    
    toDictionaryBy(
        keySelector: Selector<T, string>, 
    ): Dictionary<T>;
    
    toString(seperator?: string): string;
    
    ////////////////////////////
    // Other "finish" methods //
    ////////////////////////////
    
    /** The size of the selected sequence. */
    count(): number;
    
    /** The minimum of the selected sequence. */
    min<U extends Comparable>(
        selector: Selector<T, U>,
        comparer?: Comparer<U>,
    ): U | undefined;
    
    /** The maximum of the selected sequence. */
    max<U extends Comparable>(
        selector: Selector<T, U>,
        comparer?: Comparer<U>,
    ): U | undefined;
    
    /** The element with the smallest projected value of the selected sequence. */
    minimize<U extends Comparable>(
        selector: Selector<T, U>,
        comparer?: Comparer<U>,
    ): T | undefined;
    
    /** The element with the largest projected value of the selected sequence. */
    maximize<U extends Comparable>(
        selector: Selector<T, U>,
        comparer?: Comparer<U>,
    ): T | undefined;
    
    /** The first element of the sequence. Terminal operation. */
    first(): T | undefined;
    
    /** The last element of the sequence. */
    last(): T | undefined;
    
    aggregate<R>(initial: R, foldFunc: (acc: R, value: T) => R): R;
}

interface SequenceConstructor {
    empty<T>(this: unknown): Sequence<T>;
    singleton<T>(this: unknown, element: T): Sequence<T>;
    from<T>(this: unknown, iter: Iterable<T> | undefined): Sequence<T>;
    of<T>(this: unknown, ...elements: T[]): Sequence<T>;
    
    range(this: unknown, end: number): Sequence<number>;
    range(this: unknown, start: number, end: number): Sequence<number>;
}

const EmptyIterable: Iterable<never> = (function* (){}());

/** 
 * Immutable wrapper around an iterable. 
 * 
 * Use {@link Sequence.empty} or {@link from} to get an instance.
 */
export const Sequence
:            SequenceConstructor 
= class      SequenceImpl<T> 
implements   Sequence<T>, Iterable<T> {
    private constructor(
        private readonly source: Iterable<T> = EmptyIterable,
    ) {}
    
    [Symbol.iterator](): Iterator<T> {
        return this.source[Symbol.iterator]();
    }
    
    ////////////////////////
    // Creating sequences //
    ////////////////////////
    
    static empty<T>(): Sequence<T> {
        return new SequenceImpl(EmptyIterable);
    }
    
    static readonly default: Sequence<never> = new SequenceImpl(EmptyIterable);
    
    static singleton<T>(element: T): Sequence<T> {
        return SequenceImpl.from([element]);
    }
    
    static from<T>(iter: Iterable<T> | undefined): Sequence<T> {
        return new SequenceImpl(iter);
    }
    
    static of<T>(...elements: T[]): Sequence<T> {
        return SequenceImpl.from(elements);
    }
    
    static range(end: number): Sequence<number>;
    static range(start: number, end: number): Sequence<number>;
    static range(startOrEnd: number, maybeEnd?: number): Sequence<number> {
        let start: number;
        let end  : number;
        if (maybeEnd === undefined) {
            start = 0;
            end   = startOrEnd;
        } else {
            start = startOrEnd;
            end   = maybeEnd;
        }
        
        return new SequenceImpl(function*(): Iterable<number> {
            for (let i = start; i < end ; i++) {
                yield i;
            }
        }());
    }
    
    /////////////////////////
    // Expanding sequences //
    /////////////////////////
    
    append(element: T): Sequence<T> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<T> {
            yield* self;
            yield element;
        }());
    }
    
    concat<U>(that: Iterable<U>): Sequence<T | U> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<T | U> {
            yield* self;
            yield* that;
        }());
    }
    
    zip<U>(other: Iterable<U>): Sequence<[T, U]> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<[T, U]> {
            const iterator1 = self[Symbol.iterator]();
            const iterator2 = other[Symbol.iterator]();
            
            let result1: IteratorResult<T>;
            let result2: IteratorResult<U>;
            while(
                !(result1 = iterator1.next()).done && 
                !(result2 = iterator2.next()).done
            ) {
                yield [result1.value, result2.value];
            }
        }());
    }
    
    /////////////////////////////
    // Standard fold functions //
    /////////////////////////////
    
    select<U>(selector: Selector<T, U>): Sequence<U> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<U> {
            for (const item of self) {
                yield selector(item);
            }
        }());
    }
    
    selectMany<U>(selector: Selector<T, Iterable<U>>): Sequence<U> {
        const self = this;
        return new SequenceImpl(function* () {
            for (const item of self) {
                yield* selector(item);
            }
        }());
    }
    
    where(filter: Predicate<T>): Sequence<T> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<T> {
            for (const item of self) {
                if (filter(item)) {
                    yield item;
                }
            }
        }());
    }
    
    /** 
     * Maps a selector, and passes on all truthy values. 
     */
    selectWhere<U>(selectorPredicate: Selector<T, U>): Sequence<Truthy<U>> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<Truthy<U>> {
            for (const item of self) {
                const result = selectorPredicate(item);
                if (result) {
                    yield result as Truthy<U>;
                }
            }
        }());
    }
    
    distinct(): Sequence<T> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<T> {
            // TODO: Use equals
            const visitedSet = new Set<T>();
            for (const item of self) {
                if (!visitedSet.has(item)) {
                    yield item;
                    visitedSet.add(item);
                }
            }
        }());
    }
    
    reverse(): Sequence<T> {
        const self = this;
        return new SequenceImpl(function* (): Iterable<T> {
            yield* self.toArray().reverse();
        }());
    }
    
    groupBy<G>(representativeSelector: Selector<T, G>): Sequence<[G, T[]]> {
        const self = this;
        return new SequenceImpl(function (): Iterable<[G, T[]]> {
            let list: T[] | undefined;
            
            const result = new Map<G, T[]>;
            for (const item of self) {
                const group = representativeSelector(item);
                if (!(list = result.get(group))) {
                    result.set(group, list = []);
                }
                list.push(item);
            }
            return result;
        }());
    }
    
    ///////////
    // Pairs // 
    ///////////
    
    associate<K, V>(
        keySelector: Selector<T, K>, 
        valueSelector: Selector<T, V>,
    ): Sequence<[K, V]> { 
        const self = this;
        return new SequenceImpl(function* (): Iterable<[K, V]> {
            for (const item of self) {
                yield [keySelector(item), valueSelector(item)];
            }
        }());
    }
    
    associateBy<K>(
        keySelector: Selector<T, K>,
    ): Sequence<[K, T]> {
        return this.associate(keySelector, identity);
    }
    
    associateWith<V>(
        valueSelector: Selector<T, V>,
    ): Sequence<[T, V]> {
        return this.associate(identity, valueSelector);
    }
    
    ///////////
    // Sorts //
    ///////////
    
    orderBy(comparer: Comparer<T>): Sequence<T> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<T> {
            yield* self.toArray().sort(comparer);
        }());
    }
    
    orderOn<U extends Comparable>(
        selector: Selector<T, U>,
        comparer: Comparer<U> = compare,
    ): Sequence<T> {
        return this.orderBy((a, b) => comparer(selector(a), selector(b)));
    }
    
    ordered() {
        return this.orderBy(compareAny);
    }
    
    //////////////////////
    // Modify sequences //
    //////////////////////
    
    take(n: number): Sequence<T> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<T> {
            let i = 0;
            for (const item of self) {
                if (i++ < n) {
                    yield item;
                } else {
                    break;
                }
            }
        }());
    }
    
    skip(n: number): Sequence<T> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<T> {
            let i = 0;
            for (const item of self) {
                if (i++ < n) {
                    continue;
                } else {
                    yield item;
                }
            }
        }());
    }
    
    // take until false, then drop remaining
    takeWhile(filter: Predicate<T>): Sequence<T> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<T> {
            for (const item of self) {
                if (filter(item)) {
                    yield item;
                } else {
                    break;
                }
            }
        }());
    }
    
    // drop until false, then take remaining
    skipWhile(filter: Predicate<T>): Sequence<T> {
        const self = this;
        let skipping = true;
        return new SequenceImpl(function*(): Iterable<T> {
            for (const item of self) {
                if (skipping) {
                    if (!filter(item)) {
                        skipping = false;
                    }
                }
                if (!skipping) {
                    yield item;
                }
            }
        }());
    }
    
    shuffle(): Sequence<T> {
        const self = this;
        return new SequenceImpl(function*(): Iterable<T> {
            yield* Array_shuffle(self.toArray());
        }());
    }
    
    /////////////////////////
    // To-other-collection //
    /////////////////////////
    
    toArray(): T[] { 
        return Array.from(this); 
    }
    
    // Thanks to TS 4.X you can provide type hints without actually invoking a function. 
    // Making this pseudo """higher kinded type higher order function""" possible.
    to<C extends new (iterable: Iterable<T>) => any>(constructor: C): InstanceType<C> {
        return new constructor(this);
    }
    
    toSet(): Set<T> {
        return this.to(Set<T>); 
    }
    
    toMap(): Map<FstAny<T>, SndAny<T>>;
    toMap<K, V>(keySelector: Selector<T, K>, valueSelector: Selector<T, V>): Map<K, V>;
    toMap<K, V>(
        keySelector  : Selector<T, K> = fst as any, 
        valueSelector: Selector<T, V> = snd as any,
    ): Map<K, V> {
        return this.associate(keySelector, valueSelector).to(Map<K, V>);
    }
    
    toMapBy<K>(
        keySelector: Selector<T, K>, 
    ): Map<K, T> {
        return this.associateBy(keySelector).to(Map<K, T>);
    }
    
    toMapWith<V>(
        valueSelector: Selector<T, V>,
    ): Map<T, V> {
        return this.associateWith(valueSelector).to(Map<T, V>);
    }
    
    toDictionary<V>(
        keySelector: Selector<T, string>, 
        valueSelector: Selector<T, V>,
    ): Dictionary<V> {
        const dict = Dictionary<V>();
        for (const element of this) {
            dict[keySelector(element)] = valueSelector(element);
        }
        return dict;
    }
    
    toDictionaryBy(
        keySelector: Selector<T, string>, 
    ): Dictionary<T> {
        return this.toDictionary(keySelector, identity);
    }
    
    toString(seperator = ", "): string {
        return Array.from(this).join(seperator);
    }
    
    ////////////////////////////
    // Other "finish" methods //
    ////////////////////////////
    
    count(): number {
        if (this.source instanceof Array) {
            // NB: string iterators doesn't break surrogates, so the iterable length != the length of the string.
            return this.source.length;
        } else if (
            this.source instanceof Map || 
            this.source instanceof Set
        ) {
            return this.source.size;
        } else {
            let count = 0;
            for (const _ of this) {
                count++;
            }
            return count;
        }
    }
    
    // min, max, minimize, maximize are like this to not choke when someone tries to compare undefined
    // Alternative would be a sentinel value, that you would have to filter at the end too
    // Also note that we don't want to call the selector more than once for a given value
    
    min<U extends Comparable>(
        selector: Selector<T, U>,
        comparer: Comparer<U> = compareAny,
    ): U | undefined {
        let minimum: U | undefined;
        let first = true;
        for (const value of this) {
            const actualValue = selector(value);
            if (first) {
                minimum = actualValue;
                first   = false;
            } else if (comparer(actualValue, minimum!) < 0) {
                minimum = actualValue;
            }
        }
        return minimum;
    }
    
    max<U extends Comparable>(
        selector: Selector<T, U>,
        comparer: Comparer<U> = compareAny,
    ): U | undefined {
        let maximum: U | undefined;
        let first = true;
        for (const value of this) {
            const actualValue = selector(value);
            if (first) {
                maximum = actualValue;
                first   = false;
            } else if (comparer(actualValue, maximum!) > 0) {
                maximum = actualValue;
            }
        }
        return maximum;
    }
    
    minimize<U extends Comparable>(
        selector: Selector<T, U>,
        comparer: Comparer<U> = compareAny,
    ): T | undefined {
        let minimumItem: T | undefined;
        let minimumValue: U;
        let first = true;
        for (const value of this) {
            const actualValue = selector(value);
            if (first) {
                minimumItem  = value;
                minimumValue = actualValue;
                first        = false;
            } else if (comparer(actualValue, minimumValue!) < 0) {
                minimumItem  = value;
                minimumValue = actualValue;
            }
        }
        return minimumItem;
    }
    
    maximize<U extends Comparable>(
        selector: Selector<T, U>,
        comparer: Comparer<U> = compareAny,
    ): T | undefined {
        let maximumItem: T | undefined;
        let maximumValue: U;
        let first = true;
        for (const value of this) {
            const actualValue = selector(value);
            if (first) {
                maximumItem  = value;
                maximumValue = actualValue;
                first        = false;
            } else if (comparer(actualValue, maximumValue!) > 0) {
                maximumItem  = value;
                maximumValue = actualValue;
            }
        }
        return maximumItem;
    }
    
    first(): T | undefined {
        let result: IteratorResult<T>;
        
        const iterator = this[Symbol.iterator]();
        
        if (!(result = iterator.next()).done) {
            return result.value;
        } else { // iterator was empty
            return undefined;
        }
    }
    
    last(): T | undefined {
        let result: IteratorResult<T>;
        
        const iterator = this[Symbol.iterator]();
        let lastValue: T | undefined = undefined;
        
        while (!(result = iterator.next()).done) {
            lastValue = result.value;
        }
        return lastValue;
    }
    
    aggregate<R>(initial: R, foldFunc: (acc: R, value: T) => R): R {
        let accumulator = initial;
        for (const value of this) {
            accumulator = foldFunc(accumulator, value);
        }
        return accumulator;
    }
}

/** Short hand for {@link Sequence.from}. */
export const from: <T>(iterable: Iterable<T> | undefined) => Sequence<T> = Sequence.from;
// ^ Don't change, it is used all over the place lol
