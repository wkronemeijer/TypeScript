/** 
 * A non-empty array.
 * 
 * Readonly, because mutating this array can invalidate the type.
 */
export type NonEmpty<T> = readonly [head:T, ...tail: T[]];

export function isNonEmpty<T>(array: readonly T[]): array is NonEmpty<T> {
    return array.length > 0;
}

export function NonEmpty<T>(array: readonly T[]): NonEmpty<T> {
    if (!isNonEmpty(array)) {
        throw new Error("array was empty");
    }
    return array;
}

export function NonEmpty_last<T>(list: NonEmpty<T>): T {
    return list.at(-1)!;
}
