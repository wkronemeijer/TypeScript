// Arcane type magic

// From https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
/** 
 * Converts a union of types into a intersection of those types. 
 * 
 * Useful to create objects that can handle every possible case.
 */
export type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
) extends (
    (k: infer I) => void
) ? I : never;

// From https://github.com/microsoft/TypeScript/issues/28508#issuecomment-775742020
/**
 * Expands a type to its normal form.
 * Doesn't change the actual shape of the object, but 
 * TS does not see that and will require a cast.
 * 
 * Useful for experimenting with type functions.
 * 
 * NB: Does not honor call signatures.
 */
export type ExpandType<T> = {} & { [P in keyof T]: T[P] };

// From https://github.com/microsoft/TypeScript/issues/29729#issuecomment-554669605
/**
 * Adds autocomplete hints to a string variable.
 */
export type HintedString<THint extends string> = THint | (string & {});
