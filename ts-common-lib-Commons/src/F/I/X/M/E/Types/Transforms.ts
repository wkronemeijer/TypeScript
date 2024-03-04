import { keyof_t } from "./Primitive";

//////////////////////////////////
// Null(ish)-related transforms //
//////////////////////////////////

/** Removes null-like types from T. */
export type NonNullish<T> = T extends undefined | null ? never : T;

export type StripNull<T> = T extends null ? never : T;
export type StripUndefined<T> = T extends undefined ? never : T;

/** Combines {@link Readonly} and {@link Record}. Keeps the number of >>>> down. */
export type ReadonlyRecord<K extends keyof_t, T> = { 
    readonly [P in K]: T; 
};
