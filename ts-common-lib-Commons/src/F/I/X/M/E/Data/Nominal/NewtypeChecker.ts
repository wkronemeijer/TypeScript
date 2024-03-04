import { Function_setName, alwaysTrue, identity } from "../Function/Function";
import { HasInstance, HasInstance_inject } from "../../Types/HasInstance";
import { value_t } from "../../Types/Primitive";
import { Newtype } from "./Newtype";
import { swear } from "../../1 Core/Assert";

export interface NewtypeChecker<
    T extends value_t, 
    S extends string,
> extends HasInstance<Newtype<T, S>> {
    (value: T): Newtype<T, S>;
}

interface NewtypeCheckerOptions<T extends value_t> {
    readonly constrain: (value: unknown) => value is T; // isString(value)
    readonly normalize?: (value: T) => T; // value.trim()
    readonly isValid?: (value: T) => boolean;  // pattern.test
    readonly hasInstance?: (value: unknown) => boolean,
}

export function NewtypeChecker<
    const S extends string,
    T extends value_t,
>(
    name: S,
    options: NewtypeCheckerOptions<T>,
): (
    NewtypeChecker<T, S>
) {
    const {
        constrain,
        normalize = identity,
        isValid = alwaysTrue,
        hasInstance = value => (
            constrain(value) && 
            isValid(normalize(value))
        )
    } = options;
    type Result = Newtype<T, S>;
    const factory = (value: T): Result => {
        swear(constrain(value), () => 
            `'${String(value)}' can never be an instance of ${name}.`
        );
        value = normalize(value);
        swear(isValid(value), () =>
            `'${String(value)}' is not a valid instance of ${name}.`
        );
        return Newtype(value, name);
    };
    const checker = (value: unknown): value is Result => {
        return hasInstance(value);
    };
    HasInstance_inject(factory, checker);
    Function_setName(factory, name);
    return factory;
}
