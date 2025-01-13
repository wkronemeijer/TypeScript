import {Constructor} from "../../Types/Mixins";

export type CallableConstructor<C extends Constructor> = (
    & C 
    & {(...args: ConstructorParameters<C>): InstanceType<C>}
);

const ApplyTrap: ProxyHandler<Constructor> = {
    apply(target, _, args) {
        return Reflect.construct(target, args);
    },
};

/** 
 * Makes it so a [[Construct]]-callable function 
 * can __also__ be called as a regular [[Call]] function. 
 */
export function factorize<C extends Constructor>(
    constructor: C,
): CallableConstructor<C> {
    return new Proxy(constructor, ApplyTrap) as any;
}
