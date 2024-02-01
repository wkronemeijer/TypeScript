import { definePropertiesOnPrototype } from "../Data/Object";
import { setPrototypeOf } from "../ReExport/Module/Object";
import { panic } from "../Errors/ErrorFunctions";

const $currentImpl = Symbol("currentImplementation");

////////////////////////////////////
// Replaceable function prototype //
////////////////////////////////////

interface ReplaceableFunctionPrototype<F extends (...args: any[]) => any> {
    [$currentImpl]: F;
    
    /** Overwrites the current implementation with the given implementation. */
    readonly overwrite: (newImpl: F) => void;
    // Called overwrite and not "set" to emphasize the original impl is lost.
    
    /** 
     * Runs the body with the given implementation set, then restores the previous value after completion. 
     * 
     * There is no `_async` because calls can overlap and then behavior becomes very unpredictable.
     */
    readonly with: <R>(tempImpl: F, body: () => R) => R;
}

function overwrite<F extends (...args: any[]) => any>(
    this: ReplaceableFunction<F>, 
    newImpl: F,
): void {
    this[$currentImpl] = newImpl;
}

function with_<F extends (...args: any[]) => any, R>(
    this: ReplaceableFunction<F>, 
    tempImpl: F, 
    body: () => R,
): R {
    const oldImpl = this[$currentImpl];
    try {
        this[$currentImpl] = tempImpl;
        return body();
    } finally {
        this[$currentImpl] = oldImpl;
    }
}

function ReplaceableFunctionPrototype(): void {
    panic("ReplaceableFunctionPrototype should not be called.");
}

definePropertiesOnPrototype(ReplaceableFunctionPrototype, {
    [$currentImpl]: (...args: unknown[]) => {
        return panic("Current implementation for ReplaceableFunctionPrototype should not be called.");
    },
    overwrite,
    with: with_,
} satisfies ReplaceableFunctionPrototype<(...args: any[]) => any>)

////////////////////////////////////
// Creating replaceable functions //
////////////////////////////////////

/** 
 * A function whose implementation can be replaced at runtime, 
 * even when stored in a new variable somewhere else.
 */
export type ReplaceableFunction<F extends (...args: any[]) => any> = (
    & F 
    & ReplaceableFunctionPrototype<F>
);

export function ReplaceableFunction<F extends (...args: any[]) => any>(
    initialImpl: F
): ReplaceableFunction<F> {
    // ??? forwards arguments to the current implementation
    // Best I can come up with is "Proxy" as the thing that forwards arguments
    const proxy = (...args: Parameters<F>): ReturnType<F> => proxy[$currentImpl](...args);
    setPrototypeOf(proxy, ReplaceableFunctionPrototype);
    proxy[$currentImpl] = initialImpl;
    return proxy as any as ReplaceableFunction<F>; // ts(2322)
}

ReplaceableFunction.prototype = ReplaceableFunctionPrototype;
ReplaceableFunction.prototype.constructor = ReplaceableFunction;
