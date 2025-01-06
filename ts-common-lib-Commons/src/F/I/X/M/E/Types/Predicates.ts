// isNotASymbol?
// isNotSymbol?
// is non-symbol?
// is non-symbol?
export function isNonSymbol<T>(value: T): value is Exclude<T, symbol> {
    return typeof value !== "symbol";
}
