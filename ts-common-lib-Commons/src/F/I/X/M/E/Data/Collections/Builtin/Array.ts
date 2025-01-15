import {Comparable, compareAny, Comparer} from "../../../Traits/Ord/Comparable";
import {deprecatedAlias} from "../../../Deprecated";
import {random, trunc} from "../../../Re-export/Math";
import {Selector} from "../../../Types/Function";
import {combine} from "../../N_OrMore";

/** Returns the first valid index of an array. */
export function Array_firstIndex(array: ArrayLike<any>): number | undefined {
    return (array.length > 0) ? 0 : undefined;
}

/** Returns the last valid index of an array. */
export function Array_lastIndex(array: ArrayLike<any>): number | undefined {
    return (array.length > 0) ? (array.length - 1) : undefined;
}

/** 
 * Returns the last element of an array. Consider using `array.at(0)` instead. 
 */
export function Array_firstElement<T>(array: ArrayLike<T>): T | undefined {
    return array[0];
}

/** 
 * Returns the last element of an array. Consider using `array.at(-1)` instead. 
 */
export function Array_lastElement<T>(array: ArrayLike<T>): T | undefined {
    return array[array.length - 1];
}

/** Picks a random element from an array and returns it. Returns undefined if the array is empty. */
export function Array_randomElement<T>(self: ArrayLike<T>): T | undefined {
    const index = trunc(random() * self.length);
    return self[index];
}

/** Value indicating that the requested item was not found. */
export const Array_IndexNotFound = -1;

/** 
 * Normalizes a singleton or an array, to an array.  
 * 
 * @deprecated Use `combine` instead.
 * */
export const Array_normalize: (
    <T>(singletonOrList: T | readonly T[]) => readonly T[]
) = deprecatedAlias("Array_normalize", combine);

/** 
 * Swaps two elements of an array. 
 * Only swaps if both indices are in bounds and not equal.
 * No-op otherwise.
 * */
export function Array_swap<T>(
    self: T[], 
    i: number, 
    j: number,
): void {
    const length = self.length;
    if (
        0 <= i && i < length && 
        0 <= j && j < length && 
        i !== j
    ) {
        const temp = self[i]!;
        self[i]    = self[j]!;
        self[j]    = temp;
    }
}

// Based https://stackoverflow.com/a/2450976
export function Array_shuffleInPlace<T>(self: T[]): void {
    let currentIndex = self.length;
    let randomIndex: number;
    
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex   = trunc(random() * currentIndex);
        currentIndex -= 1;
        Array_swap(self, currentIndex, randomIndex);
    }
}

export function Array_shuffle<T>(self: readonly T[]): T[] {
    const copy = self.slice();
    Array_shuffleInPlace(copy);
    return copy;
}

export function Array_isEmpty(arr: readonly unknown[]): boolean {
    return arr.length === 0;
}

export function Array_isNotEmpty(arr: readonly unknown[]): boolean {
    return arr.length !== 0;
}

export function Array_includesAny<T>(
    self: ReadonlyArray<T>, 
    value: unknown
): value is T {
    return self.includes(value as any);
}

/////////////
// Sorting //
/////////////

/** NB: Mutates the given array. */
export function Array_sortBy<T>(self: T[], comparer: Comparer<T>): T[] {
    self.sort(comparer);
    return self;
}

/** NB: Mutates the given array. */
export function Array_sortOn<T, U extends Comparable>(
    self: T[],
    selector: Selector<T, U>,
    comparer: Comparer<U> = compareAny,
): T[] {
    Array_sortBy(self, (a, b) => comparer(selector(a), selector(b)));
    return self;
}

/** NB: Mutates the given array. */
export function Array_sorted<T>(self: T[]): T[] {
    return Array_sortBy(self, compareAny);
}
