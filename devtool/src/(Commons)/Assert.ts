export function panic(reason: string = "(no reason specified)"): never {
    throw new Error(reason);
}

function unlazy<T>(lazy: T | (() => T)): T {
    if (typeof lazy === "function") {
        // https://github.com/microsoft/TypeScript/issues/37663
        // From 2020
        return (lazy as Function)();
    } else {
        return lazy;
    }
}

export function swear(
    judgment: unknown, 
    reason: string | (() => string) = "(no reason specified)"
): asserts judgment {
    if (!judgment) {
        throw new Error(`Assertion failed: ${unlazy(reason)}`);
    }
}
