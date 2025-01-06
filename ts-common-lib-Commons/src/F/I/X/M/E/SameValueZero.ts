const { isNaN } = Number;

/** 
 * - Like ===, but NaN equals NaN
 * - Like Object.is, but 0 equals -0
 * 
 * See https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero
 */
export function SameValueZero(a: unknown, b: unknown): boolean {
    return (
        (a === b) || 
        (isNaN(a) && isNaN(b))
    );
}
