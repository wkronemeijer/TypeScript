import {CallObjectFor, StoredCall, applyStoredCall_unsafe, logStoredCall} from "./StoredCall";
import {produce, Draft, enableMapSet} from "immer";

// Apparently TS ships with ThisType
// TODO: Use ThisType
export type ReplaceThis<T, N> = {
    readonly [P in keyof T]: T[P] extends (...args: infer A) => infer R ? (
        (this: N, ...args: A) => R
    ) : never;
};

export type ObjectMatcherTemplate<S, A> = ReplaceThis<CallObjectFor<A>, Draft<S>>;

interface ObjectMatcherReducerOptions {
    readonly log?: boolean;
}

export function ObjectMatcher_toReducer<
    S extends object,
    A extends StoredCall
>(
    matcher: ObjectMatcherTemplate<S, A>, 
    options?: ObjectMatcherReducerOptions
): (
    state: S, 
    action: A,
) => S {
    const { log: shouldLog } = options ?? {};
    enableMapSet();
    return produce<S, [A]>((state, action) => {
        if (shouldLog) {
            logStoredCall(action);
        }
        applyStoredCall_unsafe(matcher, action, state);
    });
}
