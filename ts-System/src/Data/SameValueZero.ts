const { isNaN } = Number;

export function SameValueZero(a: unknown, b: unknown): boolean {
    return ((a === b) || (isNaN(a) && isNaN(b)));
}
