import { Comparable } from "../Traits/Comparable/Comparable";
import { compare } from "../Traits/Comparable/Compare";
import { value_t } from "../Types/Primitive";

/** Returns the first valid index of an array. */
export function Array_firstIndex(array: ArrayLike<any>): number | undefined {
    return (array.length > 0) ? 0 : undefined;
}

/** Returns the last valid index of an array. */
export function Array_lastIndex(array: ArrayLike<any>): number | undefined {
    return (array.length > 0) ? (array.length - 1) : undefined;
}

export function Array_firstElement<T>(array: ArrayLike<T>): T | undefined {
    return array[0];
}

export function Array_lastElement<T>(array: ArrayLike<T>): T | undefined {
    return array[array.length - 1];
}

/** Picks a random element from an array and returns it. Returns undefined if the array is empty. */
export function Array_randomElement<T>(self: ArrayLike<T>): T | undefined {
    const index = Math.trunc(Math.random() * self.length);
    return self[index];
}

/** Value indicating that the requested item was not found. */
export const Array_IndexNotFound = -1;

/** "Soft freezes" (= cools) an array by removing the mutation methods from the type. Useful if you are using template literal type maps over the `_Values` of an enumeration. */
export function Array_cool<T>(self: T[]): readonly T[] {
    return self;
}

// TODO: should have its on Types/ module
export function Array_normalize<T>(singletonOrList: T | readonly T[]): readonly T[] {
    return singletonOrList instanceof Array ? singletonOrList : [singletonOrList];
}

export function Array_insertInOrder<T extends Comparable>(self: T[], element: T): void {
    // TODO: Use insertion sort
    self.push(element);
    self.sort(compare);
}

export function Array_swap<T>(self: T[], i: number, j: number): void {
    [self[i], self[j]] = [self[j]!, self[i]!];
}

export function Array_shuffle<T>(self: T[]): void {
    // https://stackoverflow.com/a/2450976
    let randomIndex  = 0;
    let currentIndex = self.length;
    
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex   = Math.floor(currentIndex * Math.random());
        currentIndex -= 1;
        
        Array_swap(self, currentIndex, randomIndex);
    }
}

export function Array_isEmpty(arr: readonly unknown[]): boolean {
    return arr.length === 0;
}

export function Array_isNotEmpty(arr: readonly unknown[]): boolean {
    return arr.length !== 0;
}

export function Array_includesAny<T extends value_t>(self: ReadonlyArray<T>, value: unknown): value is T {
    return self.includes(value as any);
}
