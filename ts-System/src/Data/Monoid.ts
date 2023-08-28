
/**
 * Represents a monoid with
 * 1. An identity element (`default`)
 * 1. An associative join (`join`)
 * 
 * Intended to be implemented by the constructor, not individual instances.
 */
export interface Monoid<T> {
    readonly default: T;
    readonly join: (x: T, y: T) => T;
}

export function Monoid<T>(monoid: Monoid<T>): Monoid<T> {
    return monoid;
}

Monoid.number = Monoid({
    default: 0,
    join: (x, y) => x + y,
});
