import { ExpandType, UnionToIntersection, defineProperty, swear } from "@wkronemeijer/system";
import { Dispatch } from "react";

export interface StoredCall {
    readonly name: string,
    readonly args: readonly unknown[],
}

export function applyStoredCall_unsafe(
    source: object, 
    details: StoredCall, 
    thisArg: object = source,
): unknown {
    const { name, args } = details;
    swear(name in source, () => 
        `Target is missing member named '${name}'.`
    );
    const method = (source as any)[name] as unknown;
    swear(typeof method === "function", () => 
        `Member named '${name}' is not a function.`
    );
    return method.apply(thisArg, args);
}

function* segments(self: StoredCall): Iterable<unknown> {
    let first = true;
    
    yield `${self.name}(`;
    
    for (const arg of self.args) {
        if (first) {
            first = false;
        } else {
            yield ",";
        }
        if (typeof arg === "function") {
            // logged functions look terrible
            yield `ƒ ${arg.name || "(anonymous)"}`;
        } else {
            yield arg;
        }
    }
    
    yield `)`;
}


export function logStoredCall(self: StoredCall, logger = console.log): void {
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

export function augmentDispatch<T>(dispatcher: Dispatch<T>): AugmentedDispatch<T> {
    return new Proxy(dispatcher, CommonHandler) as any;
}
