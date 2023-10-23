import { panic, swear } from "./Assert";

// Techincally, this stuff should be stratified by features
export interface StringEnum<E extends string> 
extends Iterable<E> {
    /** All values, in ascending order. */
    readonly values: readonly E[];
    
    /** Default value for this enum. */
    readonly default: E;
    
    /** Verifies that given argument is a member of this enum. */
    check(x: unknown): E;
    /** Checks if a random value belongs to this enum. */
    hasInstance(x: unknown): x is E;
}

function createStringEnum<E extends string>(values: readonly E[]): StringEnum<E> {
    swear(values.length > 0, `StringEnum must not be empty.`);
    const setOfValues = new Set(values);
    swear(setOfValues.size === values.length, "All members must be unique.");
    
    const defaultValue = values[0] ?? panic("Ordinal was empty");
    
    const hasInstance = (x: unknown): x is E => setOfValues.has(x as any);
    const check       = (x: unknown): E      => hasInstance(x) ? x : panic(`'${x}' is not a member.`);
    
    const result: StringEnum<E> = {
        values,
        hasInstance,
        check,
        default: defaultValue,
        [Symbol.iterator]() {
            return values[Symbol.iterator]();
        },
    };
    
    return Object.freeze(result);
}

/**
 * Creates an enum from a set of string values.
 * Being a runtime value, it can be used for iteration, validation or having a default.
 */
export function StringEnum<const E extends string>(values: readonly E[]): StringEnum<E> {
    return createStringEnum(values);
}
