import { Constructor } from "../../Types/Mixins";

export type CallableConstructor<C extends Constructor> = (C & {
    (...args: ConstructorParameters<C>): InstanceType<C>
});

const applyTrap: ProxyHandler<Constructor> = {
    apply(target, _, args) {
        return Reflect.construct(target, args);
    },
};

/** Makes it so a constructor can be called as a regular function. */
export function factorize<C extends Constructor>(class_: C): CallableConstructor<C> {
    return new Proxy(class_, applyTrap) as any;
}
