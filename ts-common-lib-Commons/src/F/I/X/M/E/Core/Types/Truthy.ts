export type Falsy = 
    | undefined
    | null
    | false
    | 0
    | 0n
    | ""
;

export type Truthy<T> = Exclude<T, Falsy>;

export function isTruthy<const T>(value: T): value is Exclude<T, Falsy> {
    return Boolean(value);
}

export function isFalsy<const T>(value: T): value is Extract<T, Falsy> {
    return !value;
}
