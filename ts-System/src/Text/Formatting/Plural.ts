// TODO: use a proper ICU setup

const { abs } = Math;

/** 
 * Makes the word agree with the count, to replace e.g. "1 message(s)". 
 * Returns the count and the inflected noun.
 * ```ts
 * pluralize(4, "cat") === "4 cats"
 * ```
 * {@link singularize} usually reads better: `singularize(n, "stacks")`
 */
export function pluralize(
    count: number, 
    singular: string, 
    plural = `${singular}s`, // long live JS default arguments
): string {
    return `${count} ${abs(count) === 1 ?
        // 1 cat
        singular :
        // 0 cats, 2+ cats, 0.9999 cats, NaN cats
        plural
    }`;
}

function deriveSingular(plural: string): string {
    return (
        // plural.endsWith("ies") ? plural.slice(0, -3) + "y" : 
        // plural.endsWith("es")  ? plural.slice(0, -2)       : 
        plural.endsWith("s")   ? plural.slice(0, -1)       : 
        plural
    );
}

/** 
 * Makes the noun agree with the count of `count`.  
 * 
 * If no singular is provided, it removes the 's' suffix of the plural. 
 */
export function singularize(
    count: number, 
    plural: string, 
    singular = deriveSingular(plural),
): string {
    return `${count} ${abs(count) === 1 ?
        // 1 cat
        singular :
        // 0 cats, 2+ cats, 0.9999 cats, NaN cats
        plural
    }`
}

export function singularizeNameof(table: Record<string, number | undefined>): string {
    const result = new Array<string>;
    for (const [key, value] of Object.entries(table)) {
        if (value !== undefined) {
            result.push(singularize(value, key));
        }
    }
    return result.join(", ");
}
