const {
    create, 
    defineProperty, hasOwn, 
    freeze, 
    assign, entries,
} = Object;

export function isObject(value: unknown): value is object {
    return (typeof value === "object" && value !== null);
}

export {
    create, 
    defineProperty, hasOwn, 
    freeze, 
    assign, entries,
}
