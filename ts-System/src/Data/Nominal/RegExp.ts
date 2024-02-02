import { HasInstance, HasInstance_inject } from "../../Types/HasInstance";
import { Newtype } from "./Newtype";
import { panic } from "../../Errors/ErrorFunctions";

export interface RegExpChecker<M extends Newtype<string, any>>
extends HasInstance<M> {
    (value: string): M;
}

/** @deprecated Use {@link RegExpNewtype} */
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

export function RegExpNewtype<const S extends string | symbol>(
    name: S,
    pattern: RegExp
): RegExpChecker<Newtype<string, S>> {
    const hasInstance = (value: unknown): value is Newtype<string, S> => (
        typeof value === "string" &&
        pattern.test(value)
    );

    const checker = (value: string): Newtype<string, S> => (
        hasInstance(value) ? value :
            panic(`'${value}' does not match the pattern for ${String(name)}.`)
    );

    HasInstance_inject(checker, hasInstance);
    return checker;
}
