// Incredibly commonly used custom "type" to assist with 
// using a union of string literals as an enum.

import {Array_firstElement, Array_IndexNotFound, Array_lastElement} from "../Collections/Builtin/Array";
import {Comparer, compare as System_compare} from "../../Traits/Ord/Comparable";
import {StringEnumPlaceholder_hasInstance} from "./StringEnumPlaceholder";
import {StringEnumInitializer} from "./StringEnumInitializer";
import {ensures, requires} from "../../Errors/Assert";
import {EqualityComparer} from "../../Traits/Eq/Equatable";
import {defineProperty} from "../../Re-export/Object";
import {StringBuilder} from "./StringBuilder";
import {Map_reverse} from "../Collections/Builtin/Map";
import {ArrayMember} from "../Collections/Enumeration";
import {HasInstance} from "../../HasInstance";
import {Set_hasAny} from "../Collections/Builtin/Set";
import {Printable} from "../../Printable";
import {isInteger} from "../../IsX";
import {Ordering} from "../../Traits/Ord/Ordering";
import {panic} from "../../Errors/Panic";

/////////////////////
// StringEnum type //
/////////////////////

export interface StringEnum<E extends string> 
extends Iterable<E>, Printable, HasInstance<E> {
    /** 
     * The descriptive name of this enum.
     */
    readonly name: string;
    
    /** 
     * Asserts that the given string is a member of this enum 
     * and throws otherwise. 
     * 
     * If you want to check arbitrary values, use {@link check}.
     */
    (string: string): E;
    
    //////////////////////////
    // Collection of values //
    //////////////////////////
    
    /** 
     * All values, in ascending order of ordinal. 
     */
    readonly values: readonly E[];
    
    /** 
     * All values as a set. 
    */
    // Renamed for intellisense. 
    readonly setOfValues: ReadonlySet<E>;
    
    /** 
     * Iterates over all values, in ascending order of ordinal. 
     */
    [Symbol.iterator](): IterableIterator<E>;
    
    //////////////
    // Defaults //
    //////////////
    
    /** 
     * Default value for this enum. 
     */
    readonly default: E;
    
    /** 
     * Returns a modified {@link StringEnum} with the given member as {@link StringEnum.default}. 
     */
    withDefault(newDefault: E): this;
    
    ////////////////
    // Membership //
    ////////////////
    
    /** 
     * Checks if an arbitrary value is a member of this enum. 
     */
    hasInstance(x: unknown): x is E;
    
    /** 
     * Checks if an arbitrary value is a member of this enum. 
     */
    [Symbol.hasInstance](x: unknown): x is E;
    
    /** 
     * Verifies that given argument is a member of this enum and returns it. 
     */
    check(x: unknown): E;
    
    //////////////
    // class Eq //
    //////////////
    
    /** 
     * Checks if 2 enum values are equal. 
     */
    readonly equals: EqualityComparer<E>;
    
    ///////////////
    // class Ord //
    ///////////////
    
    /** 
     * The member of this enum with the smallest ordinal. 
     */
    readonly minimum: E;
    
    /** 
     * The member of this enum with the largest ordinal. 
     */
    readonly maximum: E;
    
    /** 
     * Returns the smaller of two enum values. 
     */
    min(a: E, b: E): E;
    
    /** 
     * Returns the larger of two enum values. 
     */
    max(a: E, b: E): E;
    
    /** 
     * Compares two enum values by their ordinal. 
     */
    readonly compare: Comparer<E>;
    
    ////////////////
    // class Enum //
    ////////////////
    
    /** 
     * Returns the ordinal of any member of this enum. 
     */
    getOrdinal(x: E): number;
    
    /** 
     * Returns the member of this enum with the given ordinal, if it exists. 
     */
    fromOrdinal(ord: number): E | undefined;
    
    ////////////////
    // Formatting //
    ////////////////
    
    /** 
     * The length of the longest value in this enum. 
     * 
     * Useful for formatting.
     */
    readonly maxLength: number;
    
    /**
     * Returns a string with the name and an overview of members of this enum.
     */
    toString(): string;
}

////////////////
// OrdinalMap //
////////////////

type OrdinalMap<E extends string> = ReadonlyMap<E, number>;

function OrdinalMap<E extends string>(
    values: StringEnumInitializer<E>,
): OrdinalMap<E> {
    const result       = new Map<E, number>;
    const usedNames    = new Set<E>;
    const usedOrdinals = new Set<number>;
    
    function addMember(name: E, ordinal: number): void {
        requires(!usedNames.has(name), 
            () => `Duplicate name '${name}'.`);
        requires(!usedOrdinals.has(ordinal), 
            () => `Duplicate ordinal '${ordinal}'.`);
        
        result.set(name, ordinal);
        usedNames.add(name);
        usedOrdinals.add(ordinal);
    }
    
    /** This stores the **next** ordinal. */
    let iota = 0;
    if (values instanceof Array) {
        for (const name of values) {
            addMember(name, iota++);
        }
    } else {
        for (const name in values) {
            const value = values[name];
            
            let ordinal: number;
            if (typeof value === "number") {
                ordinal = value;
            } else if (StringEnumPlaceholder_hasInstance(value)) { 
                ordinal = iota;
            } else {
                panic(`'${value}' is not a valid ordinal initializer.`);
            }
            
            // Using `requires` here gives causes TS7022 (circular type inference) for some reason 🥴
            if (isInteger(ordinal)) {
                addMember(name, ordinal);
                iota = ordinal + 1;
            } else {
                panic(`Failed to convert '${value}' into a valid ordinal.`);
            }
        }
    }
    
    return result;
}

function OrdinalMap_toString<E extends string>(values: OrdinalMap<E>): string {
    const result = new StringBuilder();
    
    result.append("StringEnum { ");
    for (const [value, ordinal] of values) {
        result.append(value);
        result.append(": ");
        result.append(ordinal.toString());
        result.append("; ");
    }
    result.append("}");
    
    return result.toString();
}

/**
 * Turns a function `(number, number) -> number` 
 * and lifts it to `(E, E) -> E`.
 * Throws if any ordinal is not a member.
 */
function liftIndexFunction<EA extends readonly string[]>(
    values: EA,
    innerFunc: (a: number, b: number) => number
): (a: ArrayMember<EA>, b: ArrayMember<EA>) => ArrayMember<EA> {
    return (a, b): ArrayMember<EA> => {
        const indexA = values.indexOf(a);
        const indexB = values.indexOf(b);
        
        requires(indexA !== Array_IndexNotFound);
        requires(indexA !== Array_IndexNotFound);
        
        const result = values[innerFunc(indexA, indexB)];
        
        ensures(result !== undefined, () => 
            `Function '${innerFunc.name}' return out of range.`);
        return result;
    };
}

function OrdinalMap_toStringEnum<E extends string>(ordinalByName: OrdinalMap<E>): StringEnum<E> {
    requires(ordinalByName.size > 0, 
        `StringEnum must not be empty.`);
    
    const memberByOrdinal = Map_reverse(ordinalByName);
    const leastOrdinal    = Math.min(...ordinalByName.values());
    
    const constructor = (value: string): E => {
        if (hasInstance(value)) {
            return value;
        } else {
            panic(`'${value}' is not a member of this string enum`);
        }
    };
    
    //////////////////////////
    // Collection of values //
    //////////////////////////
    
    const values = Array.from(ordinalByName.keys()).sort((a, b) =>
        System_compare(ordinalByName.get(a)!, ordinalByName.get(b)!)
    );
    
    const setOfValues = new Set(values);
    
    function iterator(): IterableIterator<E> {
        return values[Symbol.iterator]();
    };
    
    //////////////
    // Defaults //
    //////////////
    
    const defaultValue = (
        memberByOrdinal.get(0) ??
        memberByOrdinal.get(leastOrdinal) ??
        panic("failed to find candidate default value")
    );
    
    function withDefault(this: StringEnum<E>, newDefault: E): StringEnum<E> {
        // TODO: check performance of splatting vs Object.create in this situation
        // return { ...this, default: newDefault };
        
        return new Proxy(this, {
            get(target, key, _) {
                if (key === "default") {
                    return newDefault;
                } else {
                    return Reflect.get(target, key);
                }
            },
        });
    };
    
    ////////////////
    // Membership //
    ////////////////
    
    function hasInstance(x: unknown): x is E {
        return Set_hasAny(setOfValues, x);
    }
    
    function check(x: unknown): E {
        return hasInstance(x) ? x : panic(`'${x}' is not a member.`);
    }
    
    //////////////
    // class Eq //
    //////////////
    
    function equals(a: E, b: E) {
        return hasInstance(a) && a === b;
    }
    
    ///////////////
    // class Ord //
    ///////////////
    
    const minimum = Array_firstElement<E>(values) ?? panic();
    const maximum = Array_lastElement <E>(values) ?? panic();
    
    const min     = liftIndexFunction(values, Math.min);
    const max     = liftIndexFunction(values, Math.max);
    
    function compare(a: E, b: E): Ordering {
        return System_compare(
            values.indexOf(a), 
            values.indexOf(b)
        );
    }
    
    ////////////////
    // class Enum //
    ////////////////
    
    function getOrdinal(x: E): number {
        return ordinalByName.get(x) ?? panic(`Unknown member '${x}'.`);
    }
    
    function fromOrdinal(ord: number): E | undefined {
        return memberByOrdinal.get(ord);
    }
    
    ////////////////
    // Formatting //
    ////////////////
    
    const maxLength = Math.max(...values.map(value => value.length));
    
    function toString() {
        return OrdinalMap_toString(ordinalByName);
    }
    
    ////////////
    // Result //
    ////////////
    
    // Name is by default not writable, but it /is/ configurable
    defineProperty(constructor, "name", {
        configurable: true,
        value: `StringEnum(_)`
    });
    
    // Define an own @@hasInstance property
    // then set it later so TS infers the correct type for constructor
    defineProperty(constructor, Symbol.hasInstance, {
        configurable: true,
        writable: true,
        enumerable: true,
        value: undefined,
    });
    
    constructor.values              = values;
    constructor.toString            = toString; 
    constructor.equals              = equals;
    constructor.setOfValues         = setOfValues;
    constructor.hasInstance         = hasInstance;
    constructor[Symbol.hasInstance] = hasInstance;
    constructor.check               = check;
    constructor.compare             = compare;
    constructor.min                 = min;
    constructor.max                 = max;
    constructor.minimum             = minimum;
    constructor.maximum             = maximum;
    constructor.maxLength           = maxLength;
    constructor.default             = defaultValue;
    constructor.getOrdinal          = getOrdinal;
    constructor.fromOrdinal         = fromOrdinal;
    constructor[Symbol.iterator]    = iterator;
    constructor.withDefault         = withDefault;
    
    return constructor satisfies StringEnum<E>;
}

////////////////
// StringEnum //
////////////////

/**
 * Creates an enum from a set of string values.
 * Being a runtime value, it can be used for iteration, validation or having a default.
 */
export function StringEnum<const E extends string>(
    values: StringEnumInitializer<E>,
): StringEnum<E> {
    return OrdinalMap_toStringEnum(OrdinalMap(values));
}
