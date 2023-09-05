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
