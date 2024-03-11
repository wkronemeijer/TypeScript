const { isNaN, isFinite: Number_isFinite, isSafeInteger } = Number;
const { isArray: Array_hasInstance } = Array;

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

export function isInteger(value: unknown): value is number {
    return isSafeInteger(value);
}

export function isFinite(value: unknown): value is number {
    return Number_isFinite(value);
}

/** 
 * Returns true if the given value is of type number and not NaN. 
 * 
 * - Unlike {@link isInteger}, this function accepts floats.
 * - Unlike {@link isFinite}, this function accepts &pm;infinity.
 */
export function isNumber(value: unknown): value is number {
    return (typeof value === "number" && !isNaN(value));
}

/** 
 * Synonym for {@link Number.isNaN}. 
 * Like that function, it does not coerce its argument. 
 */
export function isErrorNumber(value: unknown): value is number {
    return isNaN(value);
} 

/////////////////////
// Reference types //
/////////////////////

// Why did `null` have to be typeof "object" again?
export function isObject(value: unknown): value is object {
    return (typeof value === "object" && value !== null);
}

export function isArray(value: unknown): value is unknown[] {
    return Array_hasInstance(value);
}

export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}
