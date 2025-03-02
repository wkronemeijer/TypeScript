import {useCallback, useMemo} from "react";

/**
 * Useful when the function argument of `useMemo` looks 
 * very similar to its dependency list.
 * 
 * @example
 * useMemo(() => myFunc(x, y, z), [x, y, z])
 * // ...is equivalent to:
 * useMemoCall(myFunc, x, y, z)
 */
export function useMemoCall<F extends (...args: any[]) => any>(...outerArgs: [
    func: F,
    ...args: Parameters<F>
]): ReturnType<F> {
    return useMemo((): ReturnType<F> => {
        const [func, ...innerArgs] = outerArgs;
        return func(...innerArgs);
    }, outerArgs);
}

/**
 * Useful when the function argument of `useCallback` looks 
 * very similar to its dependency list.
 * 
 * @example
 * useCallback(() => myFunc(x, y, z), [x, y, z])
 * // ...is equivalent to:
 * useCallbackCall(myFunc, x, y, z)
 */
export function useCallbackCall<F extends (...args: any[]) => any>(...outerArgs: [
    func: F,
    ...args: Parameters<F>
]): () => ReturnType<F> {
    return useCallback((): ReturnType<F> => {
        const [func, ...innerArgs] = outerArgs;
        return func(...innerArgs);
    }, outerArgs);
}
