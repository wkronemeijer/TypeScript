import { Printable } from "../Traits/Printable";
import { stringBuild, StringBuildable, StringBuilder } from "./StringBuilder";

export class TextLocation implements StringBuildable, Printable {
    public constructor(
        /** 1-based vertical offset. */
        readonly ln: number,
        /** 1-based horizontal offset. */
        readonly col: number,
    ) { }
    
    buildString(result: StringBuilder): void {
        result.append(this.ln.toString());
        result.append(':');
        result.append(this.col.toString());
    }
    
    toString(): string {
        return stringBuild(this);
    }
}

// Why is it called this? And not a static method? Very mysterious. 
/** Returns the line, column location of the offset in the given string. NB: Counts the number of utf-16 words, not the number of codepoints 😕. */
export function getTextLocation(s: string, offset: number): TextLocation {
    let ln = 1;
    let col = 1;
    
    // length = 1 -> 0 iterations
    const limit = Math.min(s.length - 1, offset); 
    for (let i = 0; i < limit; i++) {
        if (s[i] === "\n") {
            ln += 1;
            col = 1;
        } else {
            col += 1;
        }
    }
    
    return new TextLocation(ln, col);
}

