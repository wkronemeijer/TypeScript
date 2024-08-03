import {random, trunc} from "../../../Re-export/Math";
import {value_t} from "../../../Types/Primitive";

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
    const index = trunc(random() * self.length);
    return self[index];
}

/** Value indicating that the requested item was not found. */
export const Array_IndexNotFound = -1;

// TODO: replace when combine gets added
export function Array_normalize<T>(singletonOrList: T | readonly T[]): readonly T[] {
    return singletonOrList instanceof Array ? singletonOrList : [singletonOrList];
}

export function Array_swap<T>(self: T[], i: number, j: number): void {
    // I hope V8 has a peephole for this
    [self[i], self[j]] = [self[j]!, self[i]!];
}

export function Array_shuffleInPlace<T>(self: T[]): void {
    // https://stackoverflow.com/a/2450976
    let randomIndex  = 0;
    let currentIndex = self.length;
    
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

export function Array_includesAny<T extends value_t>(self: ReadonlyArray<T>, value: unknown): value is T {
    return self.includes(value as any);
}
