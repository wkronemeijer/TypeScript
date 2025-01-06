const { 
    isSafeInteger: Number_isSafeInteger,
    isFinite: Number_isFinite, 
    isNaN: Number_isNaN, 
 } = Number;
const {
    isArray: Array_hasInstance,
} = Array;

/////////////////////////////////
// Value types (except number) //
/////////////////////////////////

export function isUndefined(value: unknown): value is undefined {
    return value === undefined;
}

export function isNull(value: unknown): value is null {
    return value === null;
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

export function isSymbol(value: unknown): value is symbol {
    return typeof value === "symbol";
}

export function isString(value: unknown): value is string {
    return typeof value === "string";
}

//////////////
// Numerics //
//////////////

export const isInteger: (value: unknown) => value is number = Number_isSafeInteger as any;

export const isFinite: (value: unknown) => value is number = Number_isFinite as any;

/** 
 * Synonym for {@link Number.isNaN}. 
 * Like that function, it does not coerce its argument. 
 * 
 * Named like this to not conflict with `globalThis.isNaN`.
 */
export const isErrorNumber: (value: unknown) => value is number = Number_isNaN as any;

/** 
 * Returns true if the given value is of type number and not NaN. 
 * 
 * - Unlike {@link isInteger}, this function accepts floats.
 * - Unlike {@link isFinite}, this function accepts &pm;infinity.
 */
export function isNumber(value: unknown): value is number {
    return (typeof value === "number" && !Number_isNaN(value));
}

/////////////////////
// Reference types //
/////////////////////

// Why did `null` have to be typeof "object" again?
/** Returns where the argument is an object. Returns `false` for `null`. */
export function isObject(value: unknown): value is object {
    return (typeof value === "object" && value !== null);
}

/** 
 * Returns where the argument is an array. 
 * Uses the built-in `Array.prototype.isArray`. 
 */
export function isArray(value: unknown): value is unknown[] {
    return Array_hasInstance(value);
}

/** Returns where the argument is a function. */
export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}

/** Returns whether the argument is an error. */
export function isError(value: unknown): value is Error {
    return isObject(value) && value instanceof Error;
}

/** Returns whether the argument is **not** an error. */
export function isOk<const T>(value: T): value is Exclude<T, Error> {
    return !isError(value);
}
