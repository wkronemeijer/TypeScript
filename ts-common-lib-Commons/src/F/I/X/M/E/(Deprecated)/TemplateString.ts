import { StringBuilder } from "../Core/Data/Textual/StringBuilder";

/** 
 * Bakes a template string as if no template string tag function was used.
 * Useful if you are trying to add validation to such a function. 
 * 
 * Note that this does not throw if it encounters a symbol.
 */
export function TemplateString(
    strings: TemplateStringsArray, 
    ...args: unknown[]
): string {
    const result = new StringBuilder;
    
    // NB: strings.length + 1 == args.length
    const length = args.length;
    for (let i = 0; i < length; i++) {
        result.append(strings[i]);
        result.append(String(args[i]));
    }
    result.append(strings[length]);
    
    return result.toString();
}
