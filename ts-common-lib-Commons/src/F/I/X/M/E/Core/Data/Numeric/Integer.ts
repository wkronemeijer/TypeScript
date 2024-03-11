const { ceil, floor, random } = Math;

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

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
export function Random_intRangeInclusive(min: number, max: number): number {
    min = ceil(min);
    max = floor(max);
    return floor(random() * (max - min + 1) + min);
}
