export type value_t = (
    | undefined 
    | null 
    | boolean
    | number
    | bigint
    | string
    | symbol
); // aka `not object`

export type reference_t = object;

interface Nominal<S extends string | symbol> {
    readonly __nominalPhantomType: S;
}

/**
 * Declares a type that is incompatible with others sharing its base value type.
 * 
 * @example 
 * export type Hertz = Newtype<number, "Hertz">;
 * const refreshRate = 144 as Hertz;
 */
export type Newtype<
    T extends value_t, 
    S extends string | symbol,
> = T & Nominal<S>;

export function Newtype_createRegExpChecker<N extends Newtype<string, any>>(pattern: RegExp): (string: string) => N {
    return string => {
        if (!pattern.test(string)) {
            throw new Error(`String '${string}' does not match ${pattern}.`);
        }
        return string as string as N;
    }
}
