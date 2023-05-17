import { Comparable, ComparableObject } from "../../Traits/Comparable/Comparable";
import { Equatable, EquatableObject } from "../../Traits/Equatable/Equatable";
import { Hashable } from "../../Traits/Hashable/Hashable";
import { Predicate, Sequence } from "../Sequence";

export {};

// WORK IN PROGRESS

interface XCollection<T> 
extends Iterable<T> {
    readonly size: number;
    /** Determines whether this collection includes the given value. */
    includes(element: T): boolean;
    
    search(predicate: Predicate<T>): T | undefined;
    find(predicate: Predicate<T>): T;
    find(predicate: Predicate<T>): T;
    
}

interface XMutableCollection<T>
extends XCollection<T> {
    add(element: T): boolean;
    remove(element: T): boolean;
    clear(): void;
}

interface XList<T>
extends XCollection<T>, ComparableObject {
    indexOf(element: T): number | undefined;
    lastIndexOf(element: T): number | undefined;
    get(index: number): T | undefined;
    at(index: number): T | undefined;
}

interface XMutableList<T>
extends XList<T>, XMutableCollection<T> {
    set(index: number, value: T): void;
}

interface XQueue<T>
extends XCollection<T> {
    peek(): T;
}

interface XMutableQueue<T>
extends XQueue<T>, XMutableCollection<T> {
    enqueue(element: T): void;
    dequeue(element: T): void;
}

interface XStack<T>
extends XCollection<T> {
    peek(): T;
}

interface XMutableStack<T>
extends XStack<T>, XMutableCollection<T> {
    push(element: T): void;
    pop(): T | undefined;
}

interface XSet<T> 
extends XCollection<T> {
    /** Like {@link XCollection<T>.includes}, but potentially faster. */
    has(element: T): boolean;
}

interface XMutableSet<T>
extends XSet<T>, XMutableCollection<T> {
    add(element: T): boolean;
}

interface XMap<K, V>
extends XCollection<readonly [K, V]> { // 'Map' is already taken...
    has(key: K): boolean;
    hasValue(value: V): boolean;
    
    get(key: K): V | undefined;
}

interface XMutableMap<K, V> 
extends XMap<K, V>, XMutableCollection<readonly [K, V]> {
    /** 
     * Associates `key` with `value`. 
     * Returns true if this is a new entry, false otherwise. 
     */
    set(key: K, value: V): boolean;
}

/////////////////////
// Implementations //
/////////////////////

class ArrayList<T> {
    
}

class RingBuffer<T> 
// implements MutableQueue<T> 
{
    
}

// You could do LinkedList, but really, who cares?

class NativeMap<K, V> {
    
}

class NativeSet<T> {
    
}
/**
 * 
 * 
 * **Warning**: this implementation is monstrously slow, consider using {@link HashMap} instead.
 */
class EquatableSet<T extends Equatable> {
    
}

/**
 * 
 * 
 * **Warning**: this implementation is monstrously slow, consider using {@link HashMap} instead.
 */
class EquatableMap<K extends Equatable, V> {
    
}

class HashSet<T extends Hashable> {
    
}

class HashMap<K extends Hashable, V> {
    
}

