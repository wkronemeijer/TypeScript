
export const Uint32_Minimum = 0x0000_0000;
export const Uint32_Maximum = 0xFFFF_FFFF;

export const Int32_Minimum = 0x8000_0000;
export const Int32_Maximum = 0x7FFF_FFFF;

export function Number_isInt32(x: number): boolean {
    return (x | 0) === x;
}

/** Unlike `%`, this function's result is never negative. */
export function modulo(i: number, n: number): number {
    return (((i % n) + n) % n);
}
