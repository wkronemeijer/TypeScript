import { Satisfies } from "../../Types/Satisfies";
import { Ordering } from "./Ordering";

type Array_comparer<T> = NonNullable<Parameters<Array<T>["sort"]>[0]>;

export type Comparer<T> = Satisfies<(a: T, b: T) => Ordering, Array_comparer<T>>;
