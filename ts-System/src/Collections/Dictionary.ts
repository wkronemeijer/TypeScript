/** An object-based hash map. */
export interface Dictionary<T> {
    [key: string]: T;
}

export interface ReadonlyDictionary<T> {
    readonly [key: string]: T;
}

const dummyProperty = "whatever";

/** Creates an object-based hash map. */
export function Dictionary_create<T>(): Dictionary<T> {
    const dict = Object.create(null) as Dictionary<T>;
    
    // trick lifted from the tsc codebase:
    (dict[dummyProperty] as any) = null;
    delete dict[dummyProperty];
    // forces V8 to use a hash map
    
    return dict;
}

export function Dictionary_hasInstance(x: unknown): x is Dictionary<unknown> {
    return (typeof x === "object") && x !== null;
}

export function Dictionary_toMap<V>(self: ReadonlyDictionary<V>): Map<string, V> {
    const result = new Map<string, V>;
    for (const key in self) {
        const value = self[key]!;
        result.set(key, value);
    }
    return result;
}
