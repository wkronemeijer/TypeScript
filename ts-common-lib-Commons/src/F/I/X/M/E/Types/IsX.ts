const { isNaN, isSafeInteger } = Number;

/////////////////
// Value types //
/////////////////

export function isUndefined(value: unknown): value is undefined {
    return value === undefined;
}

export function isNull(value: unknown): value is null {
    return value === null;
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

export function isInteger(value: unknown): value is number {
    return (typeof value === "number" && isSafeInteger(Number))
}

export function isNumber(value: unknown): value is number {
    return (typeof value === "number" && !isNaN(value));
}

export function isSymbol(value: unknown): value is symbol {
    return typeof value === "symbol";
}

export function isString(value: unknown): value is string {
    return typeof value === "string";
}

/////////////////////
// Reference types //
/////////////////////

// Why did `null` have to be typeof "object" again?
export function isObject(value: unknown): value is object {
    return (typeof value === "object" && value !== null);
}

export function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}
