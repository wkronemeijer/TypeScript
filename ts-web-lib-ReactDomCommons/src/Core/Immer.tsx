import {Constructor, defineProperty} from "@wkronemeijer/system";
import {immerable} from "immer";

/** Marks a class so that instances are draftable. */
export function markDraftable<C extends Constructor>(
    constructor: C, 
    /** Defaults to true (!) */
    value = true,
): C {
    const configurable = true;
    defineProperty(constructor.prototype, immerable, {configurable, value});
    return constructor;
}
