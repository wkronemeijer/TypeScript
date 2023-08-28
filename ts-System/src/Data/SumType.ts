import { swear } from "../Assert";
import { ExpandType, UnionToIntersection } from "../Types/Magic";

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

type DistributeCaseMethod<TSelf, TArg extends HasKind<string>, TResult> = TArg extends any ? { 
    [P in TArg["kind"]]: (this: TSelf, options: TArg) => TResult 
} : never;

export type UnionMatcher<TSelf, TArg extends HasKind<string>, TResult> = ExpandType<UnionToIntersection<DistributeCaseMethod<TSelf, TArg, TResult>>>;

export function matchItself<TSelf, TArg extends HasKind<string>, TResult>(
    matcher: TSelf & UnionMatcher<TSelf, TArg, TResult>, 
    arg: TArg, 
): TResult {
    return matchWithContext(matcher, arg, matcher);
}

export function matchWithContext<TSelf, TArg extends HasKind<string>, TResult>(
    matcher: UnionMatcher<TSelf, TArg, TResult>, 
    arg: TArg, 
    thisArg: TSelf, 
): TResult {
    const caseMatcher = (matcher as any)[arg.kind] as unknown;
    swear(typeof caseMatcher === "function");
    return caseMatcher.call(thisArg, arg);
}

export const visit = matchWithContext;

/*

    
    
*/
