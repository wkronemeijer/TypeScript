import { HexColorString, HexColorString_toComponents } from "./HexColor";
import { Case, UnionMatcher } from "../../../Core/Data/SumType";
import { Array_lastElement } from "../../../Core/Data/Collections/Builtin/Array";
import { StringBuilder } from "../../../Core/Data/Textual/StringBuilder";
import { MarkerNewtype } from "../../../Core/Data/Nominal/Marker";
import { RegExpNewtype } from "../../../Core/Data/Nominal/RegExp";
import { StringEnum } from "../../../Core/Data/Textual/StringEnum";
import { neverPanic } from "../../../Core/Errors/Panic";
import { Satisfies } from "../../../Core/Types/Satisfies";
import { ReadWrite } from "../../../Core/Types/Magic";
import { isString } from "../../../Core/IsX";
import { Member } from "../../../Core/Data/Collections/Enumeration";
import { assign } from "../../../Core/Re-export/Object";
import { clamp } from "../../../Core/Data/Numeric/Double";
import { StringEnum_combine } from "../../../Core/Data/Textual/StringEnumCombination";
import { capitalize } from "../../../Core/Data/Textual/Casing";

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
