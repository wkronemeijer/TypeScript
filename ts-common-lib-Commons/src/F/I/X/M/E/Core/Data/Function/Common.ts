/** The identity function. */
export const identity = <T>(x: T) => x;

/** The constant function. */
export const constant = <T>(x: T) => <U>(_?: U) => x;

/** Constant &top; function. */
export const alwaysTrue = constant(true);

/** Constant &bot; function. */
export const alwaysFalse = constant(false);

/** Constant `undefined` function. */
export const alwaysUndefined = constant(undefined);

/**
 * Placeholder function which does nothing.
 * Useful as a default for functions that return `void`.
 */
export function pass(..._: unknown[]): void {
    // 😴
}
