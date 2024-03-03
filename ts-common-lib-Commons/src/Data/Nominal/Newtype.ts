import { value_t } from "../../Types/Primitive";

// based on https://stackoverflow.com/questions/49451681/typescript-what-is-the-unique-keyword-for

type NewtypePrefix<S extends string | symbol> = (
    // A :> B means that A is a supertype of B;
    // If you squint your eyes you can see it when hovering over the newtype declaration.
    S extends string ? `:> ${S}` : S
);

/**
 * Declares a type with a new identity, but the same representation as an existing type. 
 * Can be nested to represent further subsets of terms.
 * 
 * @example 
 * export type Hertz = Newtype<number, "Hertz">;
 * const refreshRate = 60 as Hertz;
 */
export type Newtype<
    T extends value_t, 
    S extends string | symbol,
> = T & { 
    readonly [P in S as NewtypePrefix<P>]: true 
};
