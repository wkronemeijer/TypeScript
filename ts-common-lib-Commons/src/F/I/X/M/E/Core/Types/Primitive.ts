// FIXME: Technically, `number` property accesses are coerced to string first (see Proxy for evidence)
// What to call `string | symbol` then?
/** A union of all possible `keyof` types. */
export type keyof_t = keyof any;

/** All primitive values with _value_ (and not _reference_) equality. */
export type value_t = 
    | undefined 
    | null 
    | boolean
    | number
    | bigint
    | string
    | symbol
;

/** Dual of {@link value_t}, defined by having reference equality. */
export type reference_t = 
    // | Function // object includes functions
    | object
;

const typeof_value = typeof NaN; // lol

/** A union of all possible `typeof` types. */
export type typeof_t = typeof typeof_value;

/** `typeof`, but it returns "null" for null, instead of "object". */
export type     typeof_withNull = typeof_t | "null";
export function typeof_withNull(x: unknown): typeof_withNull {
    return x === null ? "null" : typeof x;
}
