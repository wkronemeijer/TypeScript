import { Ordering, Ordering_Greater, Ordering_Less, Ordering_Equal } from "./Ordering";
import { Comparable, ComparableObject_hasInstance } from "./Comparable";
import { typeofWithNull } from "../../Types/TypeOfExtended";
import { Comparer } from "./Comparer";

const { isNaN } = Number;

////////////////////////
// Compare primitives //
////////////////////////

function nativeCompare(lhs: any, rhs: any): Ordering {
    switch(true) {
        case lhs > rhs: return Ordering_Greater;
        case lhs < rhs: return Ordering_Less;
        default       : return Ordering_Equal;
    }
}

function numberCompare(lhs: number, rhs: number): Ordering {
    const difference = lhs - rhs;
    return isNaN(difference) ? Ordering_Equal : Ordering(difference);
}

function constantEqual(lhs: unknown, rhs: unknown): Ordering {
    return Ordering_Equal;
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

const    constructorName_key = "constructor" satisfies keyof Object;
function constructorName(object: object): string {
    return object[constructorName_key]?.name ?? "null";
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
const compareTypeof_map: Record<typeofWithNull, number> = {
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

function compareTypeof(type1: typeofWithNull, type2: typeofWithNull): Ordering {
    return compareNumber(
        compareTypeof_map[type1], 
        compareTypeof_map[type2],
    );
}

//////////////////////
// Compare per type //
//////////////////////

const comparePerType_map: Record<typeofWithNull, Comparer<any>> = {
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
    return comparePerType_map[typeofWithNull(a)](a, b);
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
        compareTypeof(typeofWithNull(a), typeofWithNull(b)) ||
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
