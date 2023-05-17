// Based on https://stackoverflow.com/a/14379836
export function Number_toBits(double: number): [lo: number, hi: number] {
    const buffer = new ArrayBuffer(8);
    (new Float64Array(buffer))[0] = double;
    const firstWord  = (new Uint32Array(buffer))[0]!;
    const secondWord = (new Uint32Array(buffer))[1]!;
    return [firstWord, secondWord];
}

const { min, max } = Math;

export function Number_clamp(
    minimum: number, 
    value  : number, 
    maximum: number,
): number {
    return max(minimum, min(value, maximum));
    // return (
    //     value > maximum ? maximum :
    //     value < minimum ? minimum :
    //     value
    // );
}

export const clamp = Number_clamp;
