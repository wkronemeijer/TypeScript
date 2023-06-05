import { specify } from "../Testing/Testing";
import { assert } from "../Assert";


export function String_isEmpty(self: string): boolean {
    return self.length === 0;
}

export function String_isTrimmed(self: string): boolean {
    return self.trim() === self;
}

export function String_isWhitespace(self: string): boolean {
    return String_isEmpty(self.trim());
}

export function String_unPascalCase(self: string): string {
    return (
        self
        .replace(/[A-Z]/g, s => ' ' + s)
        .trim()
    );
}

const String_condense_whitespace = /\s+/g;

/** 
 * Condenses sequences of whitespace into one space (' '), and 
 * trims the result.  
 */
export function String_condense(self: string): string {
    return self.replaceAll(String_condense_whitespace, ' ').trim();
}

export function String_getCharCodes(self: string): number[] {
    const length = self.length;
    const result = new Array<number>(length);
    for (let i = 0; i < length; i++) {
        result[i] = self.charCodeAt(i);
    }
    return result;
}

/////////////
// Testing //
/////////////

specify("stringIsWhitespace()", it => {
    it("agrees with whitespace", () => {
        assert(String_isWhitespace(""));
        assert(String_isWhitespace("    "));
        assert(String_isWhitespace("\n\n\n\n\t\n\t"));
    });
    
    it("disagrees with non-whitespace", () => {
        assert(!String_isWhitespace("Hello, world!"));
        assert(!String_isWhitespace("    Hello,\n there!\n"));
    });
});
