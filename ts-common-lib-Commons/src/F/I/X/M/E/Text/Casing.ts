import { neverPanic } from "../Errors/ErrorFunctions";
import { identity } from "../Data/Function/Function";

// Documentation:
// https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#uncapitalizestringtype
// Expand "Technical details on the intrinsic string manipulation types"

/** Analogous to the {@link Uppercase} intrinsic type function. */
export function uppercase<S extends string>(str: S): Uppercase<S> {
    return str.toUpperCase() as Uppercase<S>;
}

/** Analogous to the {@link Lowercase} intrinsic type function. */
export function lowercase<S extends string>(str: S): Lowercase<S> {
    return str.toLowerCase() as Lowercase<S>;
}

/** Analogous to the {@link Capitalize} intrinsic type function. */
export function capitalize<S extends string>(str: S): Capitalize<S> {
    return str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<S>;
}

/** Analogous to the {@link Uncapitalize} intrinsic type function. */
export function uncapitalize<S extends string>(str: S): Uncapitalize<S> {
    return str.charAt(0).toLowerCase() + str.slice(1) as Uncapitalize<S>;
}

// TS isn't smart enough to automatically cancel out capitalize and uncapitalize
// Soooo we do it with this helper. It doesnt actually do anything. 

interface CasingFix {
    /** Cancels out any uncapitalize after capitalize. */
    <S extends string>(str: Uncapitalize<Capitalize<S>>): S; 
    /** Cancels out any capitalize after uncapitalize. */
    <S extends string>(str: Capitalize<Uncapitalize<S>>): S; 
}

/** Cancels out any casing. Does not actually do anything but fix the type. */
const cancelOutCapitalize: CasingFix = identity;

export function cancelCapitalize<S extends string>(str: Capitalize<S>): S {
    return cancelOutCapitalize(uncapitalize(str));
}

export function cancelUncapitalize<S extends string>(str: Uncapitalize<S>): S {
    return cancelOutCapitalize(capitalize(str));
}



/** Analogous to the {@link Capitalize} intrinsic type function. */
export function mixedcase<S extends string>(str: S): [Capitalize<S>, Uncapitalize<S>] {
    return [capitalize(str), uncapitalize(str)];
}

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
