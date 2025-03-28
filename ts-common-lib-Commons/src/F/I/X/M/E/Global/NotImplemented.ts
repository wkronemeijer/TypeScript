export {};

/** Marks a function as not (yet) implemented. */
function notImplemented(..._: unknown[]): never {
    throw new Error("This is not (yet) implemented.");
}
// Global define so you don't have to remove unused "notImplemented" imports.
// Also means every instance of notImplemented only appears once in a file.

declare global {
    const __NOT_IMPLEMENTED: typeof notImplemented;
}

const PropertyName = "__NOT_IMPLEMENTED"; // TODO: Extract the name from above

if (!Object.hasOwn(globalThis, PropertyName)) {
    Object.defineProperty(globalThis, PropertyName, { value: notImplemented });
}
