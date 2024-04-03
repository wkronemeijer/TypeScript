import { defineProperty, getPrototypeOf, setPrototypeOf } from "../../Re-export/Object";
import { nameof } from "../../Debug/Nameof";
import { HasInstance_inject } from "../../HasInstance";

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
    const originalPrototype = getPrototypeOf(func);
    setPrototypeOf(prototype, originalPrototype);
    setPrototypeOf(func, prototype);
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

/** 
 * Sets the name of a function using [[DefineOwnProperty]]. 
 * Useful if you implement the class using class expression, 
 * which uses a different name internally. 
 * This function corrects the name metadata.
 * 
 * @example
 * const MyCoolClass = class FooBarBaz {};
 * Function_setNameOf({MyCoolClass});
 * console.log(MyCoolClass.name); // "MyCoolClass"
*/
export function Function_setNameOf(table: Record<string, Function>): void {
    const name  = nameof(table);
    const value = table[name];
    if (value) {
        Function_setName(value, name);
    }
}

export const Function_setHasInstance = HasInstance_inject;
