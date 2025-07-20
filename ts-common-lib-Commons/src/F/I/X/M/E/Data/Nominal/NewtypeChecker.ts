import {HasInstance, HasInstance_inject} from "../../HasInstance";
import {alwaysTrue, identity} from "../Function/Common";
import {Function_setName} from "../Function/Function";
import {Newtype} from "./Newtype";
import {swear} from "../../Errors/Assert";

export interface NewtypeChecker<T, 
    S extends string,
> extends HasInstance<Newtype<T, S>> {
    (value: T): Newtype<T, S>;
}

interface NewtypeCheckerOptions<T> {
    /** First condition checked, to contrain the type of primitive. */
    readonly constrain: (value: unknown) => value is T; // isString(value)
    /** 
     * Second condition checked, to refine the type of primitive. 
     * Synonym for {@link refine}.
     */
    readonly isValid?: (value: T) => boolean;  // pattern.test
    /** Second condition checked, to refine the type of primitive. */
    readonly refine?: (value: T) => boolean;
    
    /** @deprecated Normalize does not work with `@@hasInstance` checks. */
    readonly normalize?: (value: T) => T; // value.trim()
}

/**
 * Utility function for quickly creating newtype constructors.
 * What it does:
 * * Check `constrain`
 * * Pass through `normalize`
 * * Check `isValid`
 */
export function NewtypeChecker<const S extends string, T>(
    name: S,
    options: NewtypeCheckerOptions<T>,
): NewtypeChecker<T, S> {
    const {
        constrain,
        normalize = identity,
        isValid = alwaysTrue,
        refine = isValid,
    } = options;
    
    if (normalize !== identity) {
        console.warn("'normalize' parameter of 'NewtypeChecker' is deprecated");
    }
    
    type Result = Newtype<T, S>;
    const factory = (value: T): Result => {
        swear(constrain(value), () => 
            `'${String(value)}' can never be an instance of ${name}.`
        );
        value = normalize(value);
        swear(refine(value), () =>
            `'${String(value)}' is not a valid instance of ${name}.`
        );
        return Newtype(value, name);
    };
    const checker = (value: unknown): value is Result => (
        constrain(value) && 
        refine(normalize(value))
    );
    HasInstance_inject(factory, checker);
    Function_setName(factory, name);
    return factory;
}
