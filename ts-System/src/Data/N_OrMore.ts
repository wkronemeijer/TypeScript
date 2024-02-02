export type OneOrMore<T>  = T | Iterable<T>;
export type ZeroOrMore<T> = OneOrMore<T> | undefined;

function isIterableObject(elements: unknown): elements is Iterable<unknown> {
    return (
        typeof elements === "object" &&
        elements !== null &&
        Symbol.iterator in elements
    );
}

/** 
 * Normalizes undefined, individual values and iterable collections of value to a single combined array type. 
 * Strings are treated as single values, even though they are technically iterable. 
 */
export function combine<const T>(elements: ZeroOrMore<T>): T[] {
    // TODO: Use switch(true)
    if (elements === undefined) {
        return [];
    } else if (isIterableObject(elements)) {
        return [...elements];
    } else {
        return [elements];
    }
}

export function primary<const T>(elements: ZeroOrMore<T>): T | undefined {
    // TODO: Use switch(true)
    if (elements === undefined) {
        return undefined;
    } else if (isIterableObject(elements)) {
        const [first] = elements;
        return first;
    } else {
        return elements;
    }
}
