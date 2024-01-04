export function isString(value: unknown): value is string {
    return typeof value === "string";
}

// Why did `null` have to be typeof "object" again?
export function isObject(value: unknown): value is object {
    return (typeof value === "object" && value !== null);
}
