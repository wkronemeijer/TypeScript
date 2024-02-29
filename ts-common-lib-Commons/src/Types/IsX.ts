export function isString(value: unknown): value is string {
    return typeof value === "string";
}

// Why did `null` have to be typeof "object" again?
export function isObject(value: unknown): value is object {
    return (typeof value === "object" && value !== null);
}

export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}

export function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}
