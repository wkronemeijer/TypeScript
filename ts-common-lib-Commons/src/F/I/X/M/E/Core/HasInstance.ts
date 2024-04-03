import { defineProperty } from "./Re-export/Object";

export interface HasInstance<T> {
    hasInstance(x: unknown): x is T;
    [Symbol.hasInstance](x: unknown): x is T;
}

const stringKey = "hasInstance" satisfies keyof HasInstance<unknown>;
const symbolKey: typeof Symbol.hasInstance = Symbol.hasInstance; 
// ↑ the specific unique symbol get lost otherwise

/**
 * Injects the both properties required for hasInstance.
 * Useful because `[[Set]]` with `@@hasInstance` fails, but `[[DefineOwnProperty]]` doesn't
 */
export function HasInstance_inject<O extends object, T>(
    object: O, 
    instanceCheck: (value: unknown) => value is T,
): asserts object is O & HasInstance<T> {
    const descriptor: PropertyDescriptor = {
        configurable: true,
        value: instanceCheck,
    };
    defineProperty(object, stringKey, descriptor);
    defineProperty(object, symbolKey, descriptor);
    return object as any;
}
