import { NewtypeChecker } from "./NewtypeChecker";
import { value_t } from "../../Types/Primitive";

/** Newtype purely used for marking. */
export function MarkerNewtype<
    T       extends value_t, 
    const S extends string,
>(
    name: S,
    typeCheck: (value: unknown) => value is T,
): (
    NewtypeChecker<T, S>
) {
    return NewtypeChecker(name, { constrain: typeCheck });
}
