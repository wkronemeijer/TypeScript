import { defineProperties } from "./Re-export/Object";

export interface HasInstance<T> {
    hasInstance(x: unknown): x is T;
    [Symbol.hasInstance](x: unknown): x is T;
}

/**
 * Injects the both properties required for hasInstance.
 * Useful because `[[Set]]` with `@@hasInstance` fails, but `[[DefineOwnProperty]]` doesn't
 */
export function HasInstance_inject<O extends object, T>(
    object: O, 
    instanceCheck: (x: unknown) => x is T,
): asserts object is O & HasInstance<T> {
    const configurable = true;
    const enumerable = false;
    const writable = true;
    defineProperties(object, {
        "hasInstance"       : { configurable, enumerable, writable, value: instanceCheck },
        [Symbol.hasInstance]: { configurable, enumerable, writable, value: instanceCheck },
    });
    return object as any;
}
