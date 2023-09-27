// Functions ment for strings with 1 codepoint.
// Same as `Char` in Haskell.

import { Newtype } from "../Types/Newtype";

const twoUnitThreshold = 0x1_0000;

function expectedLength(string: string): number {
    const codePoint = string.codePointAt(0);
    if (codePoint !== undefined) {
        return (codePoint >= twoUnitThreshold) ? 2 : 1;
    } else {
        return -1;
    }
}

export function char_hasInstance(string: string) {
    return string.length === expectedLength(string);
}

/** A single Unicode code point. */
export type     char = Newtype<string, "char">;
export function char(string: string): char {
    if (!(char_hasInstance(string))) {
        throw new Error(`'${string}' does not constitute a single code point.`);
    }
    return string as string as any;
}

Object.defineProperty(char, Symbol.hasInstance, {
    value: char_hasInstance,
});

/** Extracts the code points of a string. */
export function characters(s: string): char[] {
    return Array.from(s) as string[] as any;
}

export function Char_isSurrogate(self: char): boolean {
    return (
        self.length > 0 &&
        self.codePointAt(0) !== self.charCodeAt(0)
    );
}
