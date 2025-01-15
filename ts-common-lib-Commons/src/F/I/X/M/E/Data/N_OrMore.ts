export type OneOrMore<T>  = T | Iterable<T>;
export type ZeroOrMore<T> = OneOrMore<T> | null | undefined;

function isIterableObject(elements: unknown): elements is Iterable<unknown> {
    return (
        typeof elements === "object" &&
        elements !== null &&
        Symbol.iterator in elements
    );
}

/** 
 * Normalizes undefined, individual values and iterables into an array. 
 * 
 * **NB**: Strings are treated as single values, even though they are iterable. 
 */
export function combine<const T>(elements: ZeroOrMore<T>): T[] {
    // TODO: Use switch(true)
    if (elements === null || elements === undefined) {
        return [];
    } else if (isIterableObject(elements)) {
        return [...elements];
    } else {
        return [elements];
    }
}

/**
 * Returns the first (= "primary") element of an nullable iterable. 
 * 
 * **NB**: Strings are treated as single values, even though they are iterable. 
 * 
 * @deprecated Use `combine(...)[0]` instead. 
 * Or wait until they add `at()` to `Iterator.prototype`.
 */
export function primary<const T>(elements: ZeroOrMore<T>): T | undefined {
    // TODO: Use switch(true)
    if (elements === null || elements === undefined) {
        return undefined;
    } else if (isIterableObject(elements)) {
        const [first] = elements;
        return first;
    } else {
        return elements;
    }
}
