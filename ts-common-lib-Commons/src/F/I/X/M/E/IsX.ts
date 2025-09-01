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

/** Tests whether the argument is undefined. */
export function isUndefined(value: unknown): value is undefined {
    return value === undefined;
}

/** Tests whether the argument is null. */
export function isNull(value: unknown): value is null {
    return value === null;
}

/** Tests whether the argument is a boolean. */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

/** Tests whether the argument is a symbol. */
export function isSymbol(value: unknown): value is symbol {
    return typeof value === "symbol";
}

/** Tests whether the argument is a string. */
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

//////////////
// Numerics //
//////////////

/** Tests whether the argument is an integer. */
export const isInteger: (value: unknown) => value is number = (
    Number_isSafeInteger as any
);

/** Tests whether the argument is an integer &geq; 0. */
export function isNatural(value: unknown): value is number {
    return isInteger(value) && value >= 0;
}

/** Tests whether the argument is an integer &geq; 1. */
export function isNonZeroNatural(value: unknown): value is number {
    return isInteger(value) && value >= 1;
}

/** Tests whether the argument is finite. 
 * This excludes both infinities and NaN. */
export const isFinite: (value: unknown) => value is number = (
    Number_isFinite as any
);

/** Synonym for {@link Number.isNaN}, but functions as type guard. */
export const isNaN: (value: unknown) => value is number = (
    Number_isNaN as any
);

/** Synonym for {@link Number.isNaN}. 
 * Like that function, it does not coerce its argument. 
 * 
 * Named like this to not conflict with `globalThis.isNaN`. */
export const isErrorNumber: (value: unknown) => value is number = isNaN;

/** Returns true if the given value is of type number and not NaN. 
 * 
 * - Unlike {@link isInteger}, this function accepts rationals.
 * - Unlike {@link isFinite}, this function accepts &pm;infinity. */
export function isNumber(value: unknown): value is number {
    return (typeof value === "number" && !isNaN(value));
}

/////////////////////
// Reference types //
/////////////////////

// Why did `null` have to be typeof "object" again?
/** Returns where the argument is an object. Returns `false` for `null`. */
export function isObject(value: unknown): value is object {
    return (typeof value === "object" && value !== null);
}

/** Returns where the argument is an array. 
 * Uses the built-in `Array.prototype.isArray`. */
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

/////////////////
// Other types //
/////////////////

/** For completion. Always returns true. */
export function isUnknown(x: unknown): x is unknown {
    return true;
}

/** For completion. Always returns true. */
export function isAny(x: unknown): x is any {
    return true;
}
