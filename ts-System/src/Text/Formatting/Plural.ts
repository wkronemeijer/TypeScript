
/** 
 * Makes the word agree with the count. 
 * Returns the count and the inflected noun.
 * ```ts
 * pluralize(4, "cat") === "4 cats"
 * ```
 * Useful if you think "1 message(s)" is ugly. 
 * 
 * @deprecated {@link singularize} reads better
 */
export function pluralize(
    count: number, 
    singular: string, 
    plural = `${singular}s`, // long live JS default arguments
): string {
    return `${count} ${count === 1 ?
        // 1 cat
        singular :
        // 0 cats, 2+ cats, 0.9999 cats, NaN cats
        plural
    }`;
}

/* 
// TODO: Not too happy with the name
At the same time, it being short and convenient is good
Candidates: mayPluralize, agreeCount, agreeNumber
...don't sound as good as pluralize
Besides, as ESL it is clear enough.

Also, whether or not to include count. There are uses where you do not want the number, at the same time the current usage would require a local variable. 
Arguments for both, lets see how usage before changing anything. 

Alright usage time: maybe provide the plural and derive the singular? most enums are singular however.
*/

function deriveSingular(plural: string): string {
    return plural.endsWith('s') ? plural.slice(0, -1) : plural;
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
    return `${count} ${count === 1 ?
        // 1 cat
        singular :
        // 0 cats, 2+ cats, 0.9999 cats, NaN cats
        plural
    }`
}

// TODO: Use agree
// The trick: tomato(es)
