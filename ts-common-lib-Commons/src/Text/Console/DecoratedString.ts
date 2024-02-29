import { Newtype } from "../../Data/Nominal/Newtype";

/** 
 * A string containing nesting decoration commands. 
 * Similar to ANSI SGR codes, except these nest.
 */
export type     DecoratedString = Newtype<string, "DecoratedString">;
export function DecoratedString(string: string): DecoratedString {
    // TODO: Maybe insert a no-op vt sequence to make DecoratedStrings detectable
    return string as any;
}
