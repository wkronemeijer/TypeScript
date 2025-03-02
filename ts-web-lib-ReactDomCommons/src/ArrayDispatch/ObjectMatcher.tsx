import {CallObjectFor, StoredCall, applyStoredCall_unsafe, logStoredCall} from "./StoredCall";
import {produce, Draft} from "immer";

// TODO: Use `T & ThisType<N>?`;
export type ReplaceThis<T, N> = {
    readonly [P in keyof T]: T[P] extends (...args: infer A) => infer R ? (
        (this: N, ...args: A) => R
    ) : never;
};

export type ObjectMatcherTemplate<S, A> = ReplaceThis<CallObjectFor<A>, Draft<S>>;

interface ObjectMatcher_toReducer_Options {
    readonly logCalls?: boolean;
}

export function ObjectMatcher_toReducer<
    S extends object,
    A extends StoredCall,
>(
    matcher: ObjectMatcherTemplate<S, A>,
    options: ObjectMatcher_toReducer_Options = {},
): (state: S, action: A) => S {
    const {
        logCalls = false
    } = options;
    return produce<S, [A]>((state, action) => {
        if (logCalls) {
            logStoredCall(action);
        }
        applyStoredCall_unsafe(matcher, action, state);
    });
}

export const ActionObjectReducer = ObjectMatcher_toReducer;
