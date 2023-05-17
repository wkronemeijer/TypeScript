/** 
 * Primitives, not compound values. 
 * Defined by having _value_ and **not** _reference_ equality. 
 */
export type primitive_t = 
    | undefined 
    | null 
    | boolean
    | number
    | bigint
    | string
    | symbol
;

/** 
 * Dual of {@link primitive_t}. 
 * Defined by having reference equality. 
 */
export type reference_t = 
    // | Function // object includes functions
    | object
;
