import { MarkerNewtype } from "../../../Core/Data/Nominal/Marker";
import { isString } from "../../../Core/IsX";

const DecorationsPattern = /[\uEE0A-\uEE0F]/u;
const BEGIN_SEQUENCE = '\uEE0A';
const END_SEQUENCE   = '\uEE0B';
// ???C, ???D, ???E are unused
const POP_STYLE      = '\uEE0F';

/** 
 * A string *optionally* containing decorations. 
 * Similar to ANSI terminal codes, except these nest.
 */
export type  DecoratedString = ReturnType<typeof DecoratedString>; 
export const DecoratedString = MarkerNewtype("DecoratedString", isString);

export function containsDecorations(string: string): string is DecoratedString {
    return DecorationsPattern.test(string);
}
