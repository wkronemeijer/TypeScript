import {useMemo} from "react";

/** 
 * @example
 * useMemo(() => myFunc(x, y, z), [x, y, z])
 * // ...is equivalent to:
 * useMemoCall(myFunc, x, y, z)
 */
export function useMemoCall<F extends (...args: any[]) => any>(
    func: F,
    ...args: Parameters<F>
): ReturnType<F> {
    return useMemo<ReturnType<F>>(() => func(...args), args);
}
