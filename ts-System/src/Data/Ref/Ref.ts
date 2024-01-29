/** An immutable view of a reference to a value. */
export interface ReadonlyRef<T> {
    readonly current: T;
}

/** A mutable reference to a value. */
export interface Ref<T> {
    current: T;
}

export function Cell<T>(value: T): Ref<T> {
    return { current: value };
}

export const Ref = Cell;
