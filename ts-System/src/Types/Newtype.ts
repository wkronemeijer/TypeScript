import { HasInstance, HasInstance_inject } from "./HasInstance";
import { value_t } from "./Primitive";
import { panic } from "../Errors/ErrorFunctions";

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

///////////////////
// RegExpChecker //
///////////////////
// TODO: Move somewhere else at some point
// TODO: Rename
// NewtypePatternChecker?
// NewtypePatternedString?
// Specially runs on newtypes
// Uses pattern to string -> Newtype

interface RegExpChecker<M extends Newtype<string, any>> 
extends HasInstance<M> {
    (value: string): M;
}

export function Newtype_createRegExpChecker<T extends Newtype<string, any>>(
    pattern: RegExp
): RegExpChecker<T> {
    const hasInstance = (value: unknown): value is T => (
        typeof value === "string" &&
        pattern.test(value)
    );
    
    const checker = (value: string): T => (
        hasInstance(value) ? value : 
        panic(`'${value}' does not match the pattern for this newtype.`)
    );
    
    HasInstance_inject(checker, hasInstance);
    return checker;
}
