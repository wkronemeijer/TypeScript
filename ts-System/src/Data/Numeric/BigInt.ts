import { notImplemented } from "../../Errors/ErrorFunctions";

const step   = 32n;
const u32max = 1n << step;

export function BigInt_getInt32s(n: bigint): number[] {
    if (n < 0n) {
        notImplemented();
    }
    
    const result = new Array<number>;
    do {
        result.push(Number(n % step));
        n = n >> step;
    } while (n > u32max);
    return result;
}
