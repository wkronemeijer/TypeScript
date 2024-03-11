// Placeholder for auto-incrementing ordinals.
// Why a seperate file? Might expand it, might remove `true` at some point.

import { Array_includesAny } from "../Collections/Builtin/Array";

const placeholders = [
    true,
    "iota",
] as const;

export type StringEnumPlaceholder = (typeof placeholders)[number];

export function StringEnumPlaceholder_hasInstance(value: unknown): value is StringEnumPlaceholder {
    return Array_includesAny(placeholders, value);
}
