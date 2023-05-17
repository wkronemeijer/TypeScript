// Functions ment for strings of length 1, a.k.a. chars.




type char = string;

/** Extracts the code points of a string. */
export function characters(s: string): char[] {
    return Array.from(s);
}

export function isChar(c: unknown): c is char {
    return (
        (typeof c === "string") &&
        (c.length === expectedLength(c))
    );
}

// TODO: Wtf even is whitespace? And what about line seperators?
/** Test if a character is a kind of "whitespace". */
export function isEmptyChar(c: char): boolean {
    return isChar(c) && /[ \n\t]/.test(c);
}

const re_SurrogatePair = /[\uD800-\uDFFF]{2}/;

function expectedLength(c: string) {
    return isSurrogatePair(c) ? 2 : 1;
}

/** 
 * Returns true if the character forms a surrogate pair (to get beyond the 16-bit limitation of UCS-2). 
 * @deprecated Matches a 1-length string with a 2-length regex? Wut?
 */
export function isSurrogatePair(c: char): boolean {
    return re_SurrogatePair.test(c);
}


export function Char_isSurrogate(self: char): boolean {
    return (
        self.length > 0 &&
        self.codePointAt(0) !== self.charCodeAt(0)
    );
}
