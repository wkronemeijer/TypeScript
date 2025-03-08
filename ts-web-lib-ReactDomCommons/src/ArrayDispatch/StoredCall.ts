import {ExpandType, UnionToIntersection, defineProperty, panic} from "@wkronemeijer/system";
import {Dispatch} from "react";

export interface StoredCall {
    /** Name of the method. */
    readonly name: string,
    /** Argument list for the method. */
    readonly args: readonly unknown[],
}

export function applyStoredCall_unsafe(
    source: {}, 
    {name, args}: StoredCall, 
    thisArg: {} = source,
): unknown {
    if (!(name in source)) {
        panic(`method '${name}' is missing in target`);
    }
    const method = (source as any)[name] as unknown;
    if (typeof method !== "function") {
        panic(`property '${name}' of '${source}' is not a function`);
    }
    return method.apply(thisArg, args);
}

/////////////
// Logging //
/////////////

/** Yields segments to display inside `console.log`.  */
// console.log has funny logic when it comes to how it formats arguments
function* segments(self: StoredCall): Generator<unknown> {
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
            yield `"${arg}"`;
        } else {
            yield arg;
        }
    }
    yield `)`;
}

export function logStoredCall(self: StoredCall, logger = console.log): void {
    logger(...segments(self));
}

//////////////////////
// Augment Dispatch //
//////////////////////

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

type Spread_MethodFromStoredCall<T> = T extends any ? (
    MethodFromStoredCall<T> 
) : never;

export type CallObjectFor<T> = ExpandType<(
    UnionToIntersection<Spread_MethodFromStoredCall<T>>
)>;

export type AugmentedDispatch<T> = (
    & Dispatch<T> 
    & CallObjectFor<T>
);

const GetTrapHandler: ProxyHandler<(value: unknown) => void> = {
    get(target, name, receiver) {
        if (typeof name === "string" && !(name in target)) {
            defineProperty(target, name, {
                configurable: true,
                enumerable: true,
                value: (...args: any[]) => target({name, args}),
            });
        }
        return Reflect.get(target, name, receiver);
    },
};

export function augmentDispatch<T>(
    dispatcher: Dispatch<T>
): AugmentedDispatch<T> {
    return new Proxy(dispatcher, GetTrapHandler) as any;
}
