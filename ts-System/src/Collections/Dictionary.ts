/** An readonly object-based hash map. */
export interface ReadonlyDictionary<T> {
    readonly [key: string]: T;
}

/** An object-based hash map. */
export interface Dictionary<T> {
    [key: string]: T;
}

const DummyKey   = "meanwhile";
const DummyValue = "elsewhere";

/** Creates an object-based hash map. */
export function Dictionary<T>(): Dictionary<T> {
    const dict = Object.create(null) as Dictionary<T>;
    
    (dict[DummyKey] as any) = DummyValue;
    delete dict[DummyKey];
    // ↑ Forces V8 to use a hash map
    
    return dict;
}

export namespace Dictionary {
    export function hasInstance(value: unknown): value is Dictionary<unknown> {
        return (
            typeof value === "object" && 
            value !== null && 
            Object.getPrototypeOf(value) === null
        );
    }
    
    // How to expose this...
    Object.defineProperty(Dictionary, Symbol.hasInstance, Dictionary.hasInstance);
    
    export function from<T>(iter: Iterable<[string, T]>): Dictionary<T> {
        const result = Dictionary<T>();
        for (const [key, value] of iter) {
            result[key] = value;
        }
        return result;
    }
    
    export function toMap<V>(self: ReadonlyDictionary<V>): Map<string, V> {
        const result = new Map<string, V>;
        for (const key in self) {
            const value = self[key]!;
            result.set(key, value);
        }
        return result;
    }
}

export const Dictionary_create      = Dictionary;
export const Dictionary_hasInstance = Dictionary.hasInstance;
export const Dictionary_toMap       = Dictionary.toMap;
