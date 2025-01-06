import {doOnce} from "./DoOnce";

interface DeprecationWarningOptions {
    /** Object used to track if a warning has already been logged. */
    readonly marker: object;
    /** The name of the deprecated item. */
    readonly oldName: string;
    /** The optional name of the replacement item. */
    readonly newName?: string | undefined;
}

/** 
 * Logs a deprecation warning. 
 * Uses a marker to log only once. 
 */
export function logDeprecationWarning(options: DeprecationWarningOptions): void {
    doOnce(options.marker, () => {
        const {oldName, newName} = options;
        console.warn(newName !== undefined ? 
            `'${oldName}' is deprecated, use '${newName}' instead` : 
            `'${oldName}' is deprecated`
        );
    });
}

/** 
 * When called, warns that the given functions is deprecated.
 * Repeat calls give no such warning.
 * 
 * Meant to be embedded in the deprecated function.
 */
export function giveDeprecationWarning<F extends Function>(
    // SIDE NOTE: Why call it give when it does not return the warning?
    oldFunc: F, 
    newFunc?: Function,
): F {
    logDeprecationWarning({
        marker: oldFunc, 
        oldName: oldFunc.name, 
        newName: newFunc?.name,
    });
    return oldFunc;
}

/** Returns an alias of the function that logs one-time deprecation warning. */
export function deprecatedAlias<F extends Function>(
    oldName: string, 
    newFunc: F,
    newName = newFunc.name,
): F {
    const marker     = {};
    const logWarning = () => void console.warn(
        `'${oldName}' is deprecated, use '${newName}' instead`
    );
    
    const handler: ProxyHandler<F> = {};
    
    function addTrap<K extends (
        & keyof typeof handler
        & keyof typeof Reflect
    )>(key: K): void {
        handler[key] = (...args: unknown[]) => {
            handler[key] = undefined; 
            doOnce(marker, logWarning);
            return (Reflect[key] as any)(...args);
        }
    }
    
    addTrap("get");
    addTrap("set");
    addTrap("apply");
    addTrap("construct");
    
    return new Proxy(newFunc, handler);
}
