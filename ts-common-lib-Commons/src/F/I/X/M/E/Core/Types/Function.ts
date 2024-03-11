
export interface Selector<T, U> {
    (x: T): U;
}

export interface Predicate<T> {
    (x: T): unknown;
}

export interface TypeGuard<T> {
    (value: unknown): value is T;
}
