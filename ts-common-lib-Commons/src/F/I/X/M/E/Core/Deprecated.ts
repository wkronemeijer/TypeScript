import {panic} from "./Errors/Panic";

const warned = new WeakSet;

/** 
 * When called, warns that the given functions is deprecated.
 * Repeat calls give no such warning.
 */
export function giveDeprecationWarning<F extends Function>(oldFunc: F, newFunc?: Function): F {
    if (!warned.has(oldFunc)) {
        if (newFunc) {
            console.warn(`Function ${oldFunc.name} is no longer supported, use ${newFunc.name} instead.`);
        } else {
            console.warn(`Function ${oldFunc.name} is no longer supported`);
        }
    }
    warned.add(oldFunc);
    return oldFunc;
}
