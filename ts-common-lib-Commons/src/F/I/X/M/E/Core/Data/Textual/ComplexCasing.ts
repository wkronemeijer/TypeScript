import { capitalize, uncapitalize, uppercase, lowercase } from "./Casing";
import { neverPanic } from "../../Errors/Panic";

////////////////////////////////
// (Deprecated) simple casing //
////////////////////////////////

/** @deprecated Use {@link WordCase_Apply} with a fixed {@link WordCase} instead. */
export type BothCases<S extends string> = Capitalize<S> | Uncapitalize<S>;

/** @deprecated Use {@link mixedcase} instead. */
export function bothCases<S extends string>(str: S): [Capitalize<S>, Uncapitalize<S>] {
    return [capitalize(str), uncapitalize(str)];
}

export type OriginalCase = (typeof OriginalCase_Values)[number];
export const OriginalCase_Values = [
    "preserve"
] as const;

export type MixedCase = (typeof MixedCase_Values)[number];
export const MixedCase_Values = [
    "capitalize",
    "uncapitalize",
] as const;

export type WordCase = (typeof WordCase_Values)[number];
export const WordCase_Values = [
    "upper",
    "lower",
    ...OriginalCase_Values,
    ...MixedCase_Values
] as const;
export const WordCase_Default: WordCase = "preserve";

export type WordCase_Apply<S extends string, CO extends WordCase> =
    CO extends "preserve"     ? S                               : 
    CO extends "upper"        ? Uppercase<S>                    : 
    CO extends "lower"        ? Lowercase<S>                    : 
    CO extends "capitalize"   ? Capitalize<S>                   : 
    CO extends "uncapitalize" ? Uncapitalize<S>                 : 
    never
;

export function WordCase_apply<S extends string, CO extends WordCase>(
    str: S, casing: CO
): WordCase_Apply<S, CO> {
    switch (casing) {
        // Weird: casing doesn't narrow except for the default case
        // sooooo casts it is!
        case "preserve"    : return str               as WordCase_Apply<S, CO>;
        case "upper"       : return uppercase(str)    as WordCase_Apply<S, CO>;
        case "lower"       : return lowercase(str)    as WordCase_Apply<S, CO>;
        case "capitalize"  : return capitalize(str)   as WordCase_Apply<S, CO>;
        case "uncapitalize": return uncapitalize(str) as WordCase_Apply<S, CO>;
        default: neverPanic(casing);
    }
}

export function WordCase_applyRange<S extends string, CO extends WordCase>(str: S, casings: readonly CO[]): WordCase_Apply<S, CO>[] {
    return casings.map(casing => WordCase_apply(str, casing));
}
