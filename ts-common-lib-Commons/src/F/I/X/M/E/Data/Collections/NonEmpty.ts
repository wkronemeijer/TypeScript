/** 
 * A non-empty array.
 * 
 * Readonly, because mutating this array can invalidate the type.
 */
export type NonEmpty<T> = readonly [T, ...T[]];

export function isNonEmpty<T>(array: readonly T[]): array is NonEmpty<T> {
    return array.length > 0;
}
