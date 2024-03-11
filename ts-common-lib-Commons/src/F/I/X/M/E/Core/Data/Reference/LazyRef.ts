import { ReadonlyRef } from "./Ref";
import { swear } from "../../Errors/Assert";
import { Thunk } from "../Function/Thunk";

type  uninitialized = typeof uninitialized;
const uninitialized = Symbol("uninitialized");

class LazyRefImpl<T> implements ReadonlyRef<T> {
    private initializer: Thunk<T> | undefined = undefined;
    private value: T | uninitialized = uninitialized;
    
    constructor(initializer: Thunk<T>) {
        this.initializer = initializer;
    }
    
    get current(): T {
        let value = this.value;
        if (value === uninitialized) {
            swear(this.initializer);
            value = this.initializer();
            this.initializer = undefined;
        }
        return value;
    }
    
    // How would re-assignment work with a lazy ref?
}

export function LazyRef<T>(initializer: Thunk<T>): ReadonlyRef<T> {
    return new LazyRefImpl(initializer);
}
