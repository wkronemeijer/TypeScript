import { typeof_t, TypeToTypeString } from "./TypeOf";
import { assert, __unsafeAssert } from "../Assert";
import { Constructor } from "./Mixins";
import { neverPanic } from "../Errors/ErrorFunctions";
import { specify } from "../Testing/Testing";
import { keyof_t } from "./Primitive";

/** 
 * Checks if the specified property keys exist, 
 * and then narrows the type.  
 * 
 * @deprecated
 */
export function couldBeInstanceOf<T extends object>(value: unknown, ...keys: (keyof T)[]): value is T {
    return keys.every(key => hasKey(value, key));
}

// TODO: Since TS 4.8 or so, `in` checks narrow the variable
// Making these functions superfluous
/** 
 * Checks if a key exists on any given value. 
 * Requires manual type application. 
 * @deprecated
 */
export function hasKey<T>(value: unknown, key: keyof T): boolean
/** 
 * Checks if a key exists on any given value. 
 * @deprecated
 */
export function hasKey(value: unknown, key: keyof_t): boolean
/** Implementation. */
export function hasKey(value: unknown, key: keyof_t): boolean
{
    return ( // CNF
        // Has permanent properties?
        (
            typeof value === "object" || 
            typeof value === "function"
        ) && 
        (value !== null) &&
        (key in value)
    );
}

/** 
 * Checks if a property exists with the right type. 
 * Requires manual type application. 
 * @deprecated
 */
export function hasProperty<T, K extends keyof T>(value: unknown, key: K, type: TypeToTypeString<T[K]>): boolean;
/** 
 * Checks if a property exists with the right type. 
 * @deprecated
 */
export function hasProperty(value: unknown, key: keyof_t, type: typeof_t): boolean;
/** Implementation. */
export function hasProperty(value: unknown, key: keyof_t, type: typeof_t): boolean {
    return (
        hasKey(value, key) && 
        // hasKey removes values without keys, so ↓ will never error.
        (typeof (value as any)[key] === type)
    );
}

/** @deprecated */
export function hasInstance<C extends Constructor>(constructor: C, x: unknown): x is InstanceType<C> {
    return x instanceof constructor;
}

/** 
 * Guards if both argument have the **same** class. 
 * No subclasses!
 * @deprecated
 */
export function sharesClass<T extends Object>(x: T, y: unknown): y is T {
    return (
        y instanceof x.constructor &&
        x instanceof y.constructor 
    );
}

/** @deprecated */
export function sharesType<T>(x: T, y: unknown): y is T {
    if (typeof x === typeof y) {
        const type = typeof x;
        switch (type) {
            case "undefined":
            case "boolean":
            case "number":
            case "bigint":
            case "string":
            case "symbol":
            case "function":
                return typeof x === typeof y;
            case "object":
                __unsafeAssert(typeof y === type && y)
                return (
                    x instanceof y.constructor &&
                    y instanceof x.constructor
                );
            default:
                neverPanic(type);
        }
    } else {
        return false;
    }
}

/////////////
// Testing //
/////////////

specify("hasKey/hasProperty", it => {
    const o = { x: 4, f() {}};
    
    it("checks presence of a property", () => {
        assert( hasKey(o, "x"));
        assert(!hasKey(o, "y"));
        assert( hasKey(o, "f"));
    });
    
    it("hasProperty checks typeof", () => {
        assert( hasProperty(o, "x", "number"));
        assert(!hasProperty(o, "x", "boolean"));
        
        assert(!hasProperty(o, "y", "number"));
        
        assert( hasProperty(o, "f", "function"));
        assert(!hasProperty(o, "f", "object")); // subtle!
    });
    
    it("skips non-objects", () => {
        assert(!hasKey(420, "toString"));
        assert(!hasKey("hello", "length"));
        assert(!hasKey(undefined, "toString"));
        assert(!hasKey(null, "toString"));
        assert(!hasKey(true, "toString"));
    });
});
