import {useCallback, useLayoutEffect, useRef} from "react";
import {deprecatedAlias} from "@wkronemeijer/system";

type AnyFunc = (...args: any[]) => any;

// Based on https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
export function useEvent<F extends AnyFunc>(fn: F): F {
    const ref = useRef<F | null>(null);
    
    // TODO: Why do we use `useLayoutEffect` instead of `ref.current = fn`?
    // As for timing, we can simply say that calling it during render is UB
    useLayoutEffect(() => {
        ref.current = fn;
    }, [fn]);
    
    const stable = useCallback<AnyFunc>((...args) => {
        return (void 0, ref.current)!(...args);
    }, []);
    
    return stable as F;
}

/** @deprecated Use the plain {@link useEvent} */
export const useEventCallback = deprecatedAlias("useEventCallback", useEvent);
