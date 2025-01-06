import {isErrorNumber} from "../../IsX";
import {Newtype} from "../../Data/Nominal/Newtype";
import {sign} from "../../Re-export/Math";

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
export type Ordering = Newtype<(-1 | 0 | 1), "Ordering">;

export function Ordering(number: number): Ordering {
    // Any value is actually allowed, only the sign matters
    return sign(isErrorNumber(number) ? 0 : number) as Ordering;
}

export namespace Ordering {
    export const Less    = Ordering(-1);
    export const Equal   = Ordering( 0);
    export const Greater = Ordering(+1);
    
    export function invert(self: Ordering): Ordering {
        return Ordering(-self);
    }
}

// Namespace thing is nice, but also fragile;
// functions allow it, but const members don't (even if the thing in it is mutable)
// That's why the Namespace_Member thing are still exported.

export const Ordering_Less    = Ordering.Less;
export const Ordering_Equal   = Ordering.Equal;
export const Ordering_Greater = Ordering.Greater;
