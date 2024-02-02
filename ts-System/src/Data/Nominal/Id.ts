import { Newtype } from "./Newtype";

export interface IdFactory<N extends Newtype<number, any>> {
    (): N;
}

export function IdFactory<const S extends string | symbol>(
    _name: S,
): IdFactory<Newtype<number, S>> {
    type N = Newtype<number, S>;
    let nextId = 1;
    const factory = () => {
        return (nextId++) as N;
    };
    return factory;
}
