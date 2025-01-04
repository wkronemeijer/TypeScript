const marked = new WeakSet;

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
export function logDeprecationWarning({
    marker, 
    oldName, 
    newName, 
}: DeprecationWarningOptions): void {
    if (!marked.has(marker)) {
        console.warn(newName !== undefined ? 
            `'${oldName}' is deprecated, use '${newName}' instead` : 
            `'${oldName}' is deprecated`
        );
        marked.add(marker);
    }
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
    func: F,
): F {
    const marker = {};
    const newName = func.name;
    
    const options: DeprecationWarningOptions = {marker, oldName, newName};
    const handler: ProxyHandler<F> = {};
    
    function trap<K extends (
        & keyof typeof handler
        & keyof typeof Reflect
    )>(key: K): void {
        handler[key] = (...args: unknown[]) => {
            logDeprecationWarning(options);
            handler[key] = undefined; // remove afterwards for good measure
            return (Reflect[key] as any)(...args);
        }
    }
    
    trap("get");
    trap("set");
    trap("apply");
    trap("construct");
    
    return new Proxy(func, handler);
}
