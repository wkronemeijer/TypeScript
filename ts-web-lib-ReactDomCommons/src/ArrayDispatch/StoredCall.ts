import {ExpandType, UnionToIntersection, defineProperty, swear} from "@wkronemeijer/system";
import {Dispatch} from "react";

export interface StoredCall {
    /** Name of the method. */
    readonly name: string,
    /** Argument list for the method. */
    readonly args: readonly unknown[],
}

export function applyStoredCall_unsafe(
    source: object, 
    {name, args}: StoredCall, 
    thisArg: object = source,
): unknown {
    swear(name in source, () => 
        `method '${name}' is missing in target`
    );
    const method = (source as any)[name] as unknown;
    swear(typeof method === "function", () => 
        `property '${name}' of target is not a function.`
    );
    return method.apply(thisArg, args);
}


/** Yields segments to display inside `console.log`.  */
// console.log has funny logic when it comes to how it formats arguments
function* segments(self: StoredCall): Iterable<unknown> {
    yield `${self.name}(`;
    
    let first = true;
    for (const arg of self.args) {
        if (first) {
            first = false;
        } else {
            yield ",";
        }
        if (typeof arg === "function") {
            yield `ƒ ${arg.name || "(anonymous)"}`;
        } else if (typeof arg === "string") {
            yield `'${arg}'`;
        } else {
            yield arg;
        }
    }
    yield `)`;
}

export function logStoredCall(
    self: StoredCall, 
    logger = console.log,
): void {
    logger(...segments(self));
}

export type StoredCallFor<T> = ExpandType<{
    [P in (keyof T & string)]: T[P] extends (...args: infer A) => void ? {
        readonly name: P;
        readonly args: A;
    } : never
}[keyof T & string]>;

type MethodFromStoredCall<T> = T extends {
    readonly name: infer P, 
    readonly args: infer A,
} ? A extends any[] ? { 
    readonly [a in P & string]: (...args: A) => void 
} : never : never;

type SpreadMethodFromStoredCall<T> = T extends any ? (
    MethodFromStoredCall<T> 
): never;

export type CallObjectFor<T> = ExpandType<UnionToIntersection<SpreadMethodFromStoredCall<T>>>;

export type AugmentedDispatch<T> = (
    & Dispatch<T> 
    & CallObjectFor<T>
);

const CommonHandler: ProxyHandler<(value: unknown) => void> = {
    get(target, key, _receiver) {
        if (!(key in target) && typeof key === "string") {
            defineProperty(target, key, {
                configurable: true,
                enumerable: true,
                value: (...args: any[]) => target({ name: key, args }),
            });
        }
        return (target as any)[key];
    },
};

export function augmentDispatch<T>(
    dispatcher: Dispatch<T>
): AugmentedDispatch<T> {
    return new Proxy(dispatcher, CommonHandler) as any;
}
