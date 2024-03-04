/** 
 * Proxies the given function to call it after its arguments haven't been changed for delayMs seconds. 
 */
// Something tells me this function should be named differently.
export function debounce<F extends (...args: any[]) => void>(delayMs: number, func: F): F {
    let handle: number | undefined;
    return ((...args: any[]): void => {
        if (handle !== undefined) {
            handle = void clearTimeout(handle);
        }
        handle = setTimeout(() => func(...args), delayMs);       
    }) as F;
}

/** 
 * Counterpart to {@link debounce}. 
 * Calls the function immediately, then ignores follow-up calls for delayMs milliseconds. 
 */
export function sharedCooldown<F extends (...args: any[]) => void>(delayMs: number, func: F): F {
    let handle: number | undefined;
    return ((...args: any[]): void => {
        if (handle === undefined) {
            func(...args);
            handle = setTimeout(() => {
                handle = undefined;
            }, delayMs);   
        }
    }) as F;
}
// I love closures...
