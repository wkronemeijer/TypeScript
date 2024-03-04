import { value_t } from "../../Types/Primitive";

const newtype = Symbol("Newtype");
type  newtype = typeof newtype;

interface NewtypeContainer<T> {
    // S & T for string literals is never
    // S | T does keep both around
    // We use a function to trigger contravariance so that
    // Newtype<S> is not assignable to Newtype<S1 | S2>
    readonly [newtype]: (value: T) => void;
}

// If you use T & string you get never
// This lets you /isolate/ the underlying type.
type Isolate<T extends value_t> = (
    T extends undefined ? undefined :
    T extends null      ? null      :
    T extends boolean   ? boolean   :
    T extends number    ? number    :
    T extends bigint    ? bigint    :
    T extends string    ? string    :
    T extends symbol    ? symbol    :
    never
);

/**
 * Declares a type with a new identity, but the same representation as an existing type. 
 * 
 * @example 
 * export type Hertz = Newtype<number, "Hertz">;
 * const refreshRate = 60 as Hertz;
 */
export type Newtype<
    T extends value_t, 
    S extends string | symbol,
> = (
    & Isolate<T> 
    & (
        T extends NewtypeContainer<infer R> ? 
        NewtypeContainer<S | R> : 
        //               ↑↑↑↑↑
        // Is there another way of storing type info hierarchically?
        // Tuples of different length are not assignable to one another
        NewtypeContainer<S>
    )
);

export function Newtype<
    T extends value_t, 
    const S extends string | symbol
>(value: T, _name: S): Newtype<T, S> {
    return value as any;
}
