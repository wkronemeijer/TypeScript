// Based on https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md

import {useCallback, useLayoutEffect, useRef} from "react";

type AnyFunc = (...args: any[]) => any;

export function useEvent<F extends AnyFunc>(fn: F): F {
    const ref = useRef<F | null>(null);
    
    // TODO: Why do we use `useLayoutEffect` instead of `ref.current = fn`?
    // As for timing, we simply say that calling it during render is UB
    useLayoutEffect(() => {
        ref.current = fn;
    }, [fn]);
    
    const stable = useCallback<AnyFunc>((...args) => {
        return (void 0, ref.current)!(...args);
    }, []);
    
    return stable as F;
}

export const useEventCallback = useEvent;
