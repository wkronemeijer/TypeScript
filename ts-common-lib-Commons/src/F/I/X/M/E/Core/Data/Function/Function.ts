import { defineProperty } from "../../Re-export/Object";

/** Inverts a predicate function. */ 
export function negate<T>(
    predicate: (value: T) => unknown,
):             (value: T) => boolean {
    return value => !predicate(value);
}

/** Applies a function in reverse. `reverse "apply"` if you will. */
export function ylppa<
    F extends (...args: any[]) => any
>(...args: Parameters<F>): (func: F) => ReturnType<F> {
    return func => func(...args);
}

export function createFactory<F extends new (...args: any[]) => any>(
    constructor: F
): (...args: ConstructorParameters<F>) => InstanceType<F> {
    return (...args) => new constructor(...args);
}

/** 
 * **WARNING**: the prototype of both arguments will be overriden! 
 * Make sure to provide fresh/local arguments. 
 */
export function Function_includeProperties<F extends Function, O extends object>(func: F, prototype: O): F & O {
    const originalPrototype = Object.getPrototypeOf(func);
    Object.setPrototypeOf(prototype, originalPrototype);
    Object.setPrototypeOf(func, prototype);
    return func as F & O;
}

/** Sets the name of a function using [[DefineOwnProperty]]. */
export function Function_setName(func: Function, name: string): void {
    defineProperty(func, "name" satisfies keyof Function, {
        configurable: true,
        enumerable: false,
        writable: false,
        value: name,
    });
}
