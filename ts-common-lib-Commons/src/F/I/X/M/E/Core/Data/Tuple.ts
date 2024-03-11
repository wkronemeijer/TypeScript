/** Selects the first element of a tuple. */
export const fst = <T>(array: readonly [T, ...any[]]): T => array[0];
/** Selects the second element of a tuple. */
export const snd = <T>(array: readonly [unknown, T, ...any[]]): T => array[1];

export type FstAny<T> = T extends { readonly [0]: infer R; } ? R : never;
export type SndAny<T> = T extends { readonly [1]: infer R; } ? R : never;

export const flip = <T, U>(array: readonly [T, U]): readonly [U, T] => [array[1], array[0]];
