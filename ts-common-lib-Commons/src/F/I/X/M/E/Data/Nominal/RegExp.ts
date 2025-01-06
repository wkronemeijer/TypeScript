import {HasInstance, HasInstance_inject} from "../../HasInstance";
import {Function_setName} from "../Function/Function";
import {isString} from "../../IsX";
import {Newtype} from "./Newtype";
import {swear} from "../../Errors/Assert";

export interface RegExpChecker<M>
extends HasInstance<M> {
    (value: string): M;
    readonly pattern: RegExp;
}

export function RegExpNewtype<const S extends string>(
    name: S,
    pattern: RegExp
): RegExpChecker<Newtype<string, S>> {
    type Result = Newtype<string, S>;
    const hasInstance = (value: unknown): value is Result => (
        isString(value) && pattern.test(value)
    );
    const checker = (value: string): Result => {
        swear(hasInstance(value), () => 
            `'${value}' does not match the pattern for ${name}.`
        );
        return value;
    };
    HasInstance_inject(checker, hasInstance);
    Function_setName(checker, name);
    checker.pattern = pattern;
    // TODO: Can you freeze regices?
    return checker;
}
