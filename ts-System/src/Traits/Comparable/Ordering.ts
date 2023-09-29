import { Newtype } from "../../Types/Newtype";

/**
 * Represents the relative ordering of two items, 
 * using the same format as {@link Array.sort}.
 * 
 * To do lexicographic comparison, use the `||` operator to combine results.
 * @example
 * // ↓ is equivalent to x < y
 * if (compare(x, y) < 0) {...} 
 * @example
 * return Ordering(
 *     compare(this.year , other.year ) ||
 *     compare(this.month, other.month) ||
 *     compare(this.day  , other.day  ) 
 * );
 */
export type     Ordering = Newtype<number, "Ordering">;
export function Ordering(number: number): Ordering {
    // Any value is actually allowed, only the sign matters
    return Math.sign(number) as Ordering;
}

export const Ordering_Less    = Ordering(-1);
export const Ordering_Equal   = Ordering( 0);
export const Ordering_Greater = Ordering(+1);
