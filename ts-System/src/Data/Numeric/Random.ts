const { ceil, floor, random } = Math;

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
export function Random_intRangeInclusive(min: number, max: number): number {
    min = ceil(min);
    max = floor(max);
    return floor(random() * (max - min + 1) + min);
}
