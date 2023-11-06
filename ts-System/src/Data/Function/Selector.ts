
export interface Selector<T, U> {
    (x: T): U;
}
