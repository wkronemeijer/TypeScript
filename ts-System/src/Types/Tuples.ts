// For working with homogenous and heterogenous fixed size arrays.

// Why stop at length 7? 7 is a lucky number. 
// And otherwise sequence does not fit on a single line on my monitor.

/** All supported tuple sizes. */
export type TupleIndices = 
    | 0
    | 1
    | 2
    | 3
    | 4 
    | 5
    | 6
;

/** Creates an array of fixed size. */
export type FixedSizeArray<T, N> = 
    N extends 0 ? [] :
    N extends 1 ? [T] :
    N extends 2 ? [T, T] :
    N extends 3 ? [T, T, T] :
    N extends 4 ? [T, T, T, T] :
    N extends 5 ? [T, T, T, T, T] :
    N extends 6 ? [T, T, T, T, T, T] :
    N extends 7 ? [T, T, T, T, T, T, T] :
    T[]
;


export type OptionalParameter<T> = [] | [T | undefined];



type Opt2 = [number, number] | [number, number, number] | [number, number, number, number];




type func<a, b> = (x: a) => b;

// Sequences a tuple of functions.
// Yeah type wise its gross, but if thats kind of the point of this entire file.

export function sequence<a>                        (start: a, ...functions: [                                                                                  ]): a;
export function sequence<a, b>                     (start: a, ...functions: [func<a, b>,                                                                       ]): b;
export function sequence<a, b, c>                  (start: a, ...functions: [func<a, b>, func<b, c>,                                                           ]): c;
export function sequence<a, b, c, d>               (start: a, ...functions: [func<a, b>, func<b, c>, func<c, d>,                                               ]): d;
export function sequence<a, b, c, d, e>            (start: a, ...functions: [func<a, b>, func<b, c>, func<c, d>, func<d, e>,                                   ]): e;
export function sequence<a, b, c, d, e, f>         (start: a, ...functions: [func<a, b>, func<b, c>, func<c, d>, func<d, e>, func<e, f>,                       ]): f;
export function sequence<a, b, c, d, e, f, g>      (start: a, ...functions: [func<a, b>, func<b, c>, func<c, d>, func<d, e>, func<e, f>, func<f, g>,           ]): g;
export function sequence<a, b, c, d, e, f, g, h>   (start: a, ...functions: [func<a, b>, func<b, c>, func<c, d>, func<d, e>, func<e, f>, func<f, g>, func<g, h>]): h;
/** Implementation. */
export function sequence(start: unknown, ...functions: Function[]): unknown {
    let result = start;
    for (const function_ of functions) {
        result = function_(result);
    }
    return result;
}
