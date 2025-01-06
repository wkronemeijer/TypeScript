import { identity } from "../Function/Common";

/////////////////////////////////////////
// Intrinsic string manipulation types //
/////////////////////////////////////////

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

////////////////
// Type logic //
////////////////

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

export function mixedcase<S extends string>(str: S): [Capitalize<S>, Uncapitalize<S>] {
    return [capitalize(str), uncapitalize(str)];
}

//////////////////
// First letter //
//////////////////

export type FirstLetter<S extends string> = (
    S extends `${infer R}${string}` ? R : never
);

export function firstLetter<S extends string>(string: S): FirstLetter<S> {
    return string[0]! as FirstLetter<S>;
}
