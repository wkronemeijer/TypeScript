import { HashCode, HashCode_combine, HashCode_combineArray, HashCode_random } from "./HashCode";
import { Hashable, HashableObject } from "./Hashable";
import { String_getCharCodes } from "../../Text/String";
import { BigInt_getInt32s } from "../../Data/Numeric/BigInt";
import { typeofWithNull } from "../../Types/TypeOfExtended";
import { Number_isInt32 } from "../../Data/Numeric/Integer";
import { Number_toBits } from "../../Data/Numeric/Double";
import { HashFunction } from "./HashFunction";

// [Source] http://www.isthe.com/chongo/tech/comp/fnv/index.html#public_domain
// May be interesting to look at

// https://stackoverflow.com/a/52171480
// TODO: Make better hash functions
// here's the thing: these are intended for objects so they can be put into (Hash)Maps.
// so its all kinda whatever as long as it works.

////////////////////////
// Constant hashcodes //
////////////////////////

// Singular mappings for several constants
// Picked to have low chance of overlap with genuine integer values
const hashUndefined: HashFunction<undefined> = () => 
    HashCode(0xFACE_1E55)
;

const hashNull: HashFunction<null> = () => 
    HashCode(0xC0D1_F1ED)
;

const hashBoolean: HashFunction<boolean> = boolean => boolean ?
    HashCode(0xB01D_FACE) :
    HashCode(0xACC0_1ADE)
;

const hashNumber: HashFunction<number> = number => {
    if (Number_isInt32(number)) {
        return HashCode(number);
    } else { // Slower, but correct for _all_ numbers
        const [lo, hi] = Number_toBits(number);
        return HashCode_combine(
            HashCode(lo), 
            HashCode(hi),
        );
    }
};

const hashBigInt: HashFunction<bigint> = bigint => HashCode_combineArray(
    BigInt_getInt32s(bigint)
    .map(HashCode)
);

const hashString: HashFunction<string> = string => HashCode_combineArray(
    String_getCharCodes(string)
    .map(HashCode)
);

const hashSymbol: HashFunction<symbol> = it => {
    const text = it.description;
    if (typeof text === "string") {
        return hashString(text);
    } else {
        return HashCode(0xD15C_105E);
    }
};

/////////////////////
// Object hashcode //
/////////////////////

const    isHashableObject_key = "getHashCode" satisfies keyof HashableObject;
function isHashableObject(object: object): object is HashableObject {
    return (
        isHashableObject_key in object &&
        object.getHashCode === "function"
        // Could check the length, but any competing functions would also have length 1.
    );
}

const hashObject_cache = new WeakMap<object, HashCode>;

const hashObject: HashFunction<object> = object => {
    let hash: HashCode | undefined;
    if (hash = hashObject_cache.get(object)) {
        return hash;
    } 
    // else hash == undefined
    
    if (isHashableObject(object)) {
        hash = object.getHashCode();
    } else {
        hash = HashCode_random();
    }
    
    hashObject_cache.set(object, hash);
    return hash;
};

// Problem with hashing functions: 
// simple implementation is to hash by name
// except the mostly likely case where you hash functions uses arrow funs
const hashFunction: HashFunction<Function> = hashObject;

///////////////////
// Hash per type //
///////////////////

const hashPerType_map: Record<typeofWithNull, HashFunction<any>> = {
    undefined: hashUndefined,
    null     : hashNull,
    boolean  : hashBoolean,
    number   : hashNumber,
    bigint   : hashBigInt,
    symbol   : hashSymbol,
    string   : hashString,
    function : hashFunction,
    object   : hashObject,
} as const;

function hashPerType(x: unknown): HashCode {
    return hashPerType_map[typeofWithNull(x)](x);
}

//////////////////
// Generic hash //
//////////////////

/** 
 * Hashes any JavaScript value. 
 * Note that numbers are hashed as integers. 
 */
export const hashAny: (hashable: unknown) => HashCode = hashPerType;

/** 
 * Hashes any hashable. 
 * Note that numbers are hashed as integers; 
 * if you need double hashing you can use XXX.
 */
export const hash: (hashable: Hashable) => HashCode = hashAny;
