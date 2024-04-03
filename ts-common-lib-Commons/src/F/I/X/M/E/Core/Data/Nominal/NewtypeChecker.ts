import { HasInstance, HasInstance_inject } from "../../HasInstance";
import { alwaysTrue, identity } from "../Function/Common";
import { Function_setName } from "../Function/Function";
import { value_t } from "../../Types/Primitive";
import { Newtype } from "./Newtype";
import { swear } from "../../Errors/Assert";

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
    const checker = (value: unknown): value is Result => (
        constrain(value) && 
        isValid(normalize(value))
    );
    HasInstance_inject(factory, checker);
    Function_setName(factory, name);
    return factory;
}
