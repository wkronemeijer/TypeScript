import { HasInstance, HasInstance_inject } from "../../Types/HasInstance";
import { giveDeprecationWarning } from "../../Errors/Deprecated";
import { Function_setName } from "../Function/Function";
import { Newtype } from "./Newtype";
import { swear } from "../../Assert";

export interface RegExpChecker<M extends Newtype<string, any>>
extends HasInstance<M> {
    (value: string): M;
}

export function RegExpNewtype<const S extends string>(
    name: S,
    pattern: RegExp
): RegExpChecker<Newtype<string, S>> {
    type Result = Newtype<string, S>;
    const hasInstance = (value: unknown): value is Result => (
        typeof value === "string" &&
        pattern.test(value)
    );
    const checker = (value: string): Result => {
        swear(hasInstance(value), () => 
            `'${value}' does not match the pattern for ${name}.`
        );
        return value;
    };
    HasInstance_inject(checker, hasInstance);
    Function_setName(checker, name);
    return checker;
}

/** @deprecated Use {@link RegExpNewtype} */
export function Newtype_createRegExpChecker<T extends Newtype<string, any>>(
    pattern: RegExp
): RegExpChecker<T> {
    giveDeprecationWarning(Newtype_createRegExpChecker);
    return RegExpNewtype("(anonymous pattern type)", pattern) as any;
}
