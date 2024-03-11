// nameof equivalent
// derived from https://stackoverflow.com/a/37057212

import { requires } from "../Errors/Assert";

/** Used with an object shorthand to return the name of a variable, analogous to C&sharp;'s `nameof` operator.
 * ```
 * nameof({foo}) === "foo"
 * ```
 */
export function nameof<
    O extends { [s: string]: unknown },
>(object: O): keyof O {
    const keys = Object.keys(object);
    requires(keys.length === 1, `'object' must have exactly 1 own enumerable property.`);
    return keys[0] as keyof O;
}
