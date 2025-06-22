import {ChangeEvent, useCallback, useLayoutEffect, useRef} from "react";

type AnyFunc = (...args: any[]) => any;

// Based on https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
export function useEvent<F extends AnyFunc>(fn: F): F {
    // TODO: You want to throw if called during render
    // But you can only detect this the first time, 
    // afterwards the closure is just outdated.
    const ref = useRef<F | null>(null);
    
    // Q: Why do we use `useLayoutEffect` instead of just `ref.current = fn`?
    // A: Renders can be discarded by e.g. `Suspense`; 
    // `useLayoutEffect` on the other hand only triggers for commits.
    useLayoutEffect(() => {
        ref.current = fn;
    }, [fn]);
    
    const stable = useCallback<AnyFunc>(function(this: unknown, ...args) {
        return ref.current!.apply(this, args);
    }, []);
    
    return stable as F;
}

export const useInputEvent = useEvent<(
    (event: ChangeEvent<HTMLInputElement>) => void
)>;

export const useSelectEvent = useEvent<(
    (event: ChangeEvent<HTMLSelectElement>) => void
)>;
