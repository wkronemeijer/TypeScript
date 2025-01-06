import {useCallback, useLayoutEffect, useRef} from "react";
import {panic} from "@wkronemeijer/system";

// Based on https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md

export function useEvent<F1 extends (...args: any[]) => any>(
    func: F1
): F1 {
    // For some reason F1 and F2 differ...
    // Something about "could be instantiated with different"
    type F2 = (...args: Parameters<F1>) => ReturnType<F1>;
    
    const stableCallback = useRef<F2>(
        () => panic("should not be called during rendering")
    );
    
    // In a real implementation, this would run before layout effects
    useLayoutEffect(() => {
        stableCallback.current = func;
    }, [func]);
    
    const callback = useCallback<F2>((...args) => {
        // In a real implementation, this would throw if called during render
        let currentFunc;
        if (currentFunc = stableCallback.current) {
            return currentFunc(...args);
        } else {
            panic("Called too soon.");
        }
    }, [stableCallback]);
    
    return callback as F1;
}

export const useEventCallback = useEvent;
