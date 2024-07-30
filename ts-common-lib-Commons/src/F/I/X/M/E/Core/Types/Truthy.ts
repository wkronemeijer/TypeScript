export type Falsy = 
    | undefined
    | null
    | false
    | 0
    | ""
;

export type Truthy<T> = Exclude<T, Falsy>;

export function isTruthy<T>(value: T): value is Exclude<T, Falsy> {
    return Boolean(value);
}
