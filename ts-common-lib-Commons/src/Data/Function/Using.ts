export function using<T, R>(value: T, body: (it: T) => R): R {
    return body(value);
}
