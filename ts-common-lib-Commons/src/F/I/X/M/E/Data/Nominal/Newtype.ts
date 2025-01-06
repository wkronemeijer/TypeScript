import { Contravariant, UnionToIntersection } from "../../Types/Magic";
import { value_t } from "../../Types/Primitive";

const newtype = Symbol("Newtype");
type  newtype = typeof newtype;

interface is<T> {
    // S & T for string literals is never
    // S | T does keep both around
    // We use a function to trigger contravariance so that
    // Newtype<S1 | S2> is assignable to Newtype<S1>, but not vice-versa.
    readonly [newtype]: Contravariant<T>;
}

/** Spreads `is<T>` over every member of the tag union */
type SpreadIs<Tag extends string> = Tag extends any ? is<Tag> : never;

/**
 * Declares a type with a new identity, but the same representation as an existing type. 
 * 
 * @example 
 * export type Hertz = Newtype<number, "Hertz">;
 * const refreshRate = 60 as Hertz;
 */
export type Newtype<
    Type extends value_t, 
    Tag extends string,
> = (
    & Type 
    & UnionToIntersection<SpreadIs<Tag>>
);

export function Newtype<
    T extends value_t, 
    const S extends string
>(value: T, _name: S): Newtype<T, S> {
    return value as any;
}

// TODO: Some kind of refinement type thing...
// Problem is type-fu like that is very brittle
