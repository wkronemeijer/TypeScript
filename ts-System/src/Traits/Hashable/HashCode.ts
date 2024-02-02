import { Int32_Maximum, Int32_Minimum } from "../../Data/Numeric/Integer";
import { Random_intRangeInclusive } from "../../Data/Numeric/Random";
import { Newtype } from "../../Data/Nominal/Newtype";

/** 
 * A 32-bit integer.  
 * 
 * You can force `number`s to be `i32`s by bit-OR-ing them with zero. 
 * For example: `(12.34|0) === 12`
 * */
export type     HashCode = Newtype<number, "HashCode">;
export function HashCode(number: number): HashCode {
    return (number | 0) as HashCode;
}

export function HashCode_combineArray(hashes: readonly HashCode[]): HashCode {
    let result = 17;
    for (const hash of hashes) {
        
        result = (((result << 5) - result) + hash) | 0;
        // result = (result * 31 + hash) | 0;
        //        ^^^^^^^^^^^^^^^^^^
        // This part is always less than MAX_SAFE_INTEGER
    }
    return HashCode(result);
}

// From https://stackoverflow.com/a/1646913
export function HashCode_combine(...hashes: HashCode[]): HashCode {
    return HashCode_combineArray(hashes);
}

/** 
 * Generates a random hashcode. 
 * Not very useful if you don't store it somewhere. 
 */
export function HashCode_random(): HashCode {
    return HashCode(Random_intRangeInclusive(Int32_Minimum, Int32_Maximum));
}
