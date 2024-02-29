/**
 * Utility for asserting types.
 * @example
 * type assert_5IsANumber = Assert<5 extends number ? true : false>;
 */
export type Assert<T extends true> = T;
