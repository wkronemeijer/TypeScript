import { requires } from "../Assert";
import { value_t } from "./Primitive";

/////////////
// Newtype //
/////////////
// based on https://stackoverflow.com/questions/49451681/typescript-what-is-the-unique-keyword-for

interface Nominal<S extends string | symbol> {
    readonly __nominalPhantomType: S;
}

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
> = T & Nominal<S>;

export function Newtype_createRegExpChecker<M extends Newtype<string, any>>(
    regex: RegExp
): (x: string) => M {
    return x => {
        requires(regex.test(x), 
            () => `string '${x}' failed to validate.`);
        return x as M;
    }
}
