import {NewtypeChecker} from "./NewtypeChecker";

/** Newtype purely used for marking. */
export function MarkerNewtype<T, const S extends string>(
    name: S,
    typeCheck: (value: unknown) => value is T,
): NewtypeChecker<T, S> {
    return NewtypeChecker(name, {constrain: typeCheck});
}
