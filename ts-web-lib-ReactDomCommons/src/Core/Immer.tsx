import {Constructor, defineProperty} from "@wkronemeijer/system";
import {immerable} from "immer";

/** Marks a class so that instances are draftable. */
export function markDraftable<C extends Constructor>(constructor: C): C {
    defineProperty(constructor.prototype, immerable, {value: true});
    return constructor;
}
