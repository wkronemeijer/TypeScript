import { identity } from "./Function";

export type  Thunk<T> = () => T;
export const Thunk: <T>(thunk: () => T) => Thunk<T> = identity;

export function Thunk_hasInstance(value: unknown): value is Thunk<unknown> {
    return typeof value === "function";
}
