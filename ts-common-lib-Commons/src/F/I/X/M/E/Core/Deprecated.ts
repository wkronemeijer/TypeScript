import { panic } from "./Errors/Panic";

const warned = new WeakSet;

/** 
 * When called, warns that the given functions is deprecated.
 * Repeat calls give no such warning.
 */
export function giveDeprecationWarning<F extends Function>(func: F): F {
    if (!warned.has(func)) {
        console.warn(`Function ${func.name} is no longer supported.`);
    }
    warned.add(func);
    return func;
}
// TODO: call it giveDeprecationWarning?

/** 
 * @deprecated This thing throws an error for some reason, use {@link giveDeprecationWarning} instead.
 * Marks a function as no longer supported and will throw an error. */
export function deprecated(): never {
    giveDeprecationWarning(deprecated);
    panic(`This is no longer supported.`);
}
