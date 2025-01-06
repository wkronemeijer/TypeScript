import {RefObject, useEffect, useLayoutEffect, useRef} from "react";

// Based on https://github.com/juliencrn/usehooks-ts/blob/master/src/useEventListener/useEventListener.ts

export function useEventListener<E extends Event>(
    target: (
        | EventTarget 
        | null
        | undefined
    ), 
    eventName: (
        | keyof WindowEventMap 
        | keyof HTMLElementEventMap
        | (string & {})
    ),
    listener: (event: E) => void,
    useCapture = false,
): void {
    const stableListener = useRef(listener);
    
    useLayoutEffect(() => {
        stableListener.current = listener; // do update it
    }, [listener]);
    
    useEffect(() => {
        if (target) {
            const callback = (
                (event: E) => stableListener.current?.(event)
            ) as EventListener;
            
            target.addEventListener(eventName, callback, useCapture);
            return () => {
                target.removeEventListener(eventName, callback, useCapture);
            };
        }
    }, [target, eventName, stableListener, useCapture]);
}

export function useWindowEventListener<
    K extends keyof WindowEventMap
>(
    eventName: K,
    listener: (event: WindowEventMap[K]) => void,
    useCapture = false,
): void {
    useEventListener(window, eventName, listener, useCapture);
}

export function useRefEventListener<
    T extends HTMLElement, 
    K extends keyof HTMLElementEventMap,
>(
    targetRef: RefObject<T>, 
    eventName: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    useCapture = false,
): void {
    useEventListener(targetRef.current, eventName, listener, useCapture);
}
