import { Newtype } from "./Newtype";

export interface IdFactory<N extends Newtype<number, any>> {
    (): N;
    /** 
     * Starts a new, independent id sequence for the same newtype. 
     * 
     * TODO: Needs a better name. Something like `unique`? `Owned`? `startOver`?
     */
    readonly new: () => IdFactory<N>;
}

export function IdNewtype<const S extends string | symbol>(
    _name: S,
): IdFactory<Newtype<number, S>> {
    type N = Newtype<number, S>;
    function createFactory(): IdFactory<N> {
        let nextId = 1;
        const factory = () => {
            return (nextId++) as N;
        };
        factory.new = createFactory;
        return factory;
    }
    return createFactory();
}
