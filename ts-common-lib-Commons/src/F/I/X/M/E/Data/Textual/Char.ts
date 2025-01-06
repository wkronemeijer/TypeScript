// Functions ment for strings with 1 codepoint.
// Same as `Char` in Haskell.

import { HasInstance_inject } from "../../HasInstance";
import { Newtype } from "../Nominal/Newtype";

const twoUnitThreshold = 0x1_0000;

function expectedLength(string: string): number {
    const codePoint = string.codePointAt(0);
    if (codePoint !== undefined) {
        return (codePoint >= twoUnitThreshold) ? 2 : 1;
    } else {
        return -1;
    }
}

export function char_hasInstance(value: unknown): value is char {
    return typeof value === "string" && value.length === expectedLength(value);
}

/** A single Unicode code point. */
export type     char = Newtype<string, "char">;
export function char(string: string): char {
    if (!(char_hasInstance(string))) {
        throw new Error(`'${string}' does not constitute a single code point.`);
    }
    return string as string as any;
}

HasInstance_inject(char, char_hasInstance);

/** Extracts the code points of a string. */
export function characters(s: string): char[] {
    return [...s] as string[] as any;
}

export function Char_isSurrogate(self: char): boolean {
    return (
        self.length > 0 &&
        self.codePointAt(0) !== self.charCodeAt(0)
    );
}
