import { HashCode } from "./HashCode";

export type HashFunction<T> = (a: T) => HashCode;
