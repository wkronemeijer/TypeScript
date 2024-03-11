import { ExpandType, UnionToIntersection } from "../Types/Magic";
import { getDescriptiveName } from "./Names/GetName";

///////////
// Cases //
///////////

export interface HasKind<K extends string> {
    readonly kind: K;
}

export type Case<
    K extends string, 
    P extends {},
> = ExpandType<
    & HasKind<K>
    & P
>;

////////////////////
// Matching cases //
////////////////////

type HandlerForEachCase<
    TCase extends HasKind<string>, 
    TArgs extends any[], 
    TResult,
> = TCase extends any ? { 
    readonly [P in TCase["kind"]]: (options: TCase, ...args: TArgs) => TResult 
} : never;

export type UnionMatcher<
    TCase extends HasKind<string>, 
    TArgs extends any[], 
    TResult,
> = ExpandType<UnionToIntersection<HandlerForEachCase<TCase, TArgs, TResult>>>;

/**
 * Creates a function that calls the appropriate method for handling a specific case.
 * 
 * For recursive enums, it is recommended you put this function as a property initalizer in a class. 
 */
export function UnionMatcher<
    TCase extends HasKind<string>, 
    TArgs extends any[], 
    TResult,
>(
    self: UnionMatcher<TCase, TArgs, TResult>
): (case_: TCase, ...args: TArgs) => TResult {
    return (case_, ...args) => {
        const kind = case_.kind;
        const leafMatcher = (self as any)[kind] as unknown;
        if (!(typeof leafMatcher === "function")) {
            const name = getDescriptiveName(self);
            throw new Error(`${name} is missing case for '${kind}'.`);
        }
        return leafMatcher.call(self, case_, ...args);
    }
}
