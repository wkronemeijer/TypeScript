import {typeof_withNull, value_t} from "../../Types/Primitive";
import {isFunction, isObject} from "../../IsX";
import {getConstructorName} from "../../Data/Names/GetConstructorName";
import {Ordering} from "./Ordering";
import {panic} from "../../Errors/Panic";

const {Less, Equal, Greater} = Ordering;

//////////////
// Comparer //
//////////////

export type Comparer<T> = (a: T, b: T) => Ordering;

//////////////////////
// ComparableObject //
//////////////////////

/** Makes an object {@link Comparable}. */
export interface ComparableObject {
    /** 
     * Compares this and the given object.  
     * 
     * The global `compare` function compares two objects using this function,
     * but only if they share the same function.
     */
    compare(other: this): Ordering;
}

export function ComparableObject_hasInstance(value: unknown): value is ComparableObject {
    return (
        isObject(value) &&
        ("compare" satisfies keyof ComparableObject) in value &&
        isFunction(value.compare) &&
        value.compare.length === 1
    );
}

////////////////
// Comparable //
////////////////

/** 
 * All values that are explicitly comparable. 
 * Objects must implement {@link ComparableObject}.
 * To compare functions, use {@link compareAny} directly.
 */
export type Comparable = 
    | value_t
    | ComparableObject
;

////////////////////////
// Compare primitives //
////////////////////////

function nativeCompare(lhs: any, rhs: any): Ordering {
    switch(true) {
        case lhs > rhs: return Greater;
        case lhs < rhs: return Less;
        default       : return Equal;
    }
}

function numberCompare(lhs: number, rhs: number): Ordering {
    return Ordering(lhs - rhs);
}

function constantEqual(_lhs: unknown, _rhs: unknown): Ordering {
    return Equal;
}

const compareUndefined: Comparer<undefined> = constantEqual;
const compareNull     : Comparer<null>      = constantEqual;
const compareBoolean  : Comparer<boolean>   = nativeCompare;
const compareNumber   : Comparer<number>    = numberCompare;
const compareBigInt   : Comparer<bigint>    = nativeCompare;
const compareString   : Comparer<string>    = nativeCompare;

function compareSymbol(lhs: Symbol, rhs: Symbol): Ordering {
    return nativeCompare(lhs.description, rhs.description);
}

function compareFunction(lhs: Function, rhs: Function): Ordering {
    return compareString(lhs.name, rhs.name);
}

/////////////////////
// Compare objects //
/////////////////////

const isComparableObject = ComparableObject_hasInstance;
getConstructorName
function constructorName(object: object): string {
    return object["constructor" satisfies keyof Object]?.name ?? "null";
    // TypeScript doesn't show it, 
    // but Object.create(null) objects don't have a constructor property.
}

function compareObject(lhs: object, rhs: object): Ordering {
    if (
        isComparableObject(lhs) && 
        isComparableObject(rhs) &&
        lhs.compare === rhs.compare
    ) {
        const result = lhs.compare(rhs);
        // Manual assertion because I don't trust performance of `ensures`
        // TODO: check performance of assertion functions
        if (typeof result === "number" && isFinite(result)) {
            return result;
        } else {
            throw new TypeError(`compare() should return a finite number, not '${result}'.`);
        }
    } else {
        return compareString(constructorName(lhs), constructorName(rhs));
    }
}

/////////////////////
// Typeof ordering //
/////////////////////

let iota = 0;
const compareTypeof_map: Record<typeof_withNull, number> = {
    undefined: iota++,
    null     : iota++,
    boolean  : iota++,
    number   : iota++,
    bigint   : iota++,
    symbol   : iota++,
    string   : iota++,
    function : iota++,
    object   : iota++,
};

function compareTypeof(type1: typeof_withNull, type2: typeof_withNull): Ordering {
    return compareNumber(
        compareTypeof_map[type1], 
        compareTypeof_map[type2],
    );
}

//////////////////////
// Compare per type //
//////////////////////

const comparePerType_map: Record<typeof_withNull, Comparer<any>> = {
    undefined: compareUndefined,
    null     : compareNull,
    boolean  : compareBoolean,
    number   : compareNumber,
    bigint   : compareBigInt,
    symbol   : compareSymbol,
    string   : compareString,
    function : compareFunction,
    object   : compareObject, // watch out for null
} as const;

/** Pre-condition: a and b share `typeof`. */
function comparePerType<T>(a: T, b: T): Ordering {
    return comparePerType_map[typeof_withNull(a)](a, b);
}

/////////////////////
// Generic compare //
/////////////////////

/** 
 * Like {@link compare}, but can be used on any two values.
 * 
 * Note that when used as the comparator for {@link Array.sort}, 
 * `undefined` is always sorted last, 
 * ignoring the ordering imposed by this function.
 */
export function compareAny(a: unknown, b: unknown): Ordering {
    return Ordering(
        compareTypeof(typeof_withNull(a), typeof_withNull(b)) ||
        comparePerType(a, b)
    );
}

// Uses compare if the two are of equal type, otherwise sorts by name of the constructor (LOL)
/** 
 * Compares two values of the same type. 
 * To compare any two values, use {@link compareAny}. 
 */
export const compare: 
    <T extends Comparable>(a: T, b: T) => Ordering 
= compareAny;

///////////////////////
// Compare iterables //
///////////////////////

export function compareIterable<T extends Comparable>(
    as: Iterable<T>,
    bs: Iterable<T>
): Ordering {
    const iterA = as[Symbol.iterator]();
    const iterB = bs[Symbol.iterator]();
    
    let resultA: IteratorResult<T>;
    let resultB: IteratorResult<T>;
    let ordering: Ordering;
    while (true) {
        resultA = iterA.next();
        resultB = iterB.next();
        
        if (!resultA.done && !resultB.done) {
            if (ordering = compare(resultA.value, resultB.value)) {
                return ordering;
            } else {
                continue;
            }
        } else if (resultA.done && resultB.done) { // both complete
            return Equal;
        } else if (resultA.done) { // i.e. sequence a is shorter
            return Less;
        } else if (resultB.done) { // i.e. sequence b is shorter
            return Greater;
        } else {
            panic();
        }
    }
}
