/** 
 * A function whose implementation can be replaced at runtime, 
 * even when stored in a new variable somewhere else.
 */
export type ReplaceableFunction<
    F extends (...args: any[]) => any
> = F & {
    readonly replace: (newImplementation: F) => void;
    // TODO: Support using a different function for testing purposes
};

export function ReplaceableFunction<F extends (...args: any[]) => any>(placeholder: F): ReplaceableFunction<F> {
    let implementation = placeholder;
    function result(...args: Parameters<F>): ReturnType<F> {
        return implementation(...args);
    }
    result.replace = function (newImplementation: F): void {
        implementation = newImplementation;
    }
    return result as ReplaceableFunction<F>; // ts(2322)
}
