export interface HasInstance<T> {
    [Symbol.hasInstance](x: unknown): x is T;
}


export type InstanceOwner<T> =
    | { [Symbol.hasInstance](x: unknown): x is T; } 
    | {
        new(...args: any[]): T;
        [Symbol.hasInstance](x: unknown): boolean;
    }
;

// In place until https://github.com/microsoft/TypeScript/pull/55052 is integrated into tsc
export function InstanceOwner_hasInstance<T>(self: InstanceOwner<T>, value: unknown): value is T {
    return value instanceof (self as Function);
}
