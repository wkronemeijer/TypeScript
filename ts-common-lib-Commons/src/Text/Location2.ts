import { ensures } from "../Assert";
import { StringBuilder } from "./StringBuilder";

// This entire file was lifted from the ts-PineInterpreter codebase
// ...I must say, past me coding something nice.


/** Returns the line, column location of the offset in the given string. NB: Counts the number of utf-16 words, not the number of codepoints 😕. */
function getTextLocation(s: string, offset: number): [line: number, column: number] {
    let [ln, col] = [1, 1];
    
    // if length = 1 -> do 0 iterations
    const limit = Math.min(s.length - 1, offset); 
    for (let i = 0; i < limit; i++) {
        if (s[i] === "\n") {
            ln += 1;
            col = 1;
        } else {
            col += 1;
        }
    }
    
    return [ln, col];
}

// TODO: This name is bad
function getLineLocation(s: string, offset: number): [lineStart: number, lineEnd: number] {
    let [start, end] = [0, s.length];
    
    outer:
    for (let i = 0; i < s.length; i++) {
        if (i === offset) {
            
            inner:
            for (let j = i; j < s.length; j++) {
                if (s[j] === '\r' || s[j] === '\n') {
                    end = j;
                    break outer;
                }
            }
            
            end = s.length;
            break outer;
        }
        
        if (s[i] === "\n" && (i + 1 < s.length)) {
            start = i + 1;
        } 
    }
    
    ensures(0 <= start && start <= end && end <= s.length);
    return [start, end]
}

const re_Newline = /\n/g;
function getMaxLineNo(s: string): number {
    const matches = s.match(re_Newline);
    return 1 + (matches?.length ?? 0);
}

interface TextPreviewOptions {
    source: string;
    errorStart: number;
    errorEnd: number;
    color?: boolean;
    errorChar?: string;
    
}

/** 
 * Returns a fancy error preview, like this:
 * ```
 *      42| fun doStuff() {
 *              ^^^^^^^
 * ```
 * Or like this:
 * ```
 *      42| fun doStuff() {
 *                    ><
 * ```
 * Depending on the length of the range.
 */
export function getTextPreview(options: TextPreviewOptions): string {
    /*
    The plan:
    1) Extract location with getTextLocation
    2) Extract the whole (starting) line, with lineStart and lineEnd
    3) Remember that end > lineEnd, and so you have to leave out the next line(s)
    
    
    <ln>| <pre-code><error-code><post-code>?
    <pad ><pad     >^^^^^^^^^^^^
    
     */
    
    const {
        source,
        errorStart, 
        errorEnd, 
        color = true, 
        errorChar = "~",
    } = options;
    
    const [ln, col] = getTextLocation(source, errorStart);
    const [lineStart, lineEnd] = getLineLocation(source, errorStart);
    const lineNumberSize = getMaxLineNo(source).toString().length;
    
    const previewContextStart = lineStart;
    const previewErrorStart   = errorStart;
    const previewErrorEnd     = Math.min(errorEnd, lineEnd);
    const previewContextEnd   = lineEnd;
    
    const lineNumber = ln.toString().padStart(lineNumberSize);
    // kantlijn = line seperating the margin from the content
    const kantlijn = ` ┃ `; 
    
    const pre = source.substring(previewContextStart, previewErrorStart);
    const err = source.substring(previewErrorStart  , previewErrorEnd  );
    const aft = source.substring(previewErrorEnd    , previewContextEnd);
    
    const sb = new StringBuilder;
    
    // Line 1
    sb.append(lineNumber);
    sb.append(kantlijn); 
    sb.append(pre);
    sb.append(err);
    sb.append(aft);
    sb.appendLine();
    
    // Line 2
    sb.append(' '.repeat(lineNumberSize)); 
    sb.append(kantlijn); 
    sb.append(' '.repeat(pre.length)); 
    if (err.length > 0) {
        sb.append(errorChar.repeat(err.length));
    } else {
        sb.append("↖");
    }
    // sb.appendLine();
    
    return sb.toString();
}
