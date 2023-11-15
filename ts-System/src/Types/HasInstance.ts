export interface HasInstance<T> {
    hasInstance(x: unknown): x is T;
    [Symbol.hasInstance](x: unknown): x is T;
}

/**
 * Injects the both properties required for hasInstance.
 * Useful because `Function#@@hasInstance` is non-writable by default.
 */
export function HasInstance_inject<O extends object, T>(
    object: O, 
    instanceCheck: (x: unknown) => x is T,
): asserts object is O & HasInstance<T> {
    Object.defineProperties(object, {
        "hasInstance"       : { value: instanceCheck },
        [Symbol.hasInstance]: { value: instanceCheck },
    });
    return object as any;
}
