import { panic } from "../../Errors/ErrorFunctions";
import { Ref } from "./Ref";

type  uninitialized = typeof uninitialized;
const uninitialized = Symbol("uninitialized");

class WriteOnceRefImpl<T> 
implements Ref<T> {
    private value: T | uninitialized = uninitialized;
    
    get current(): T {
        const value = this.value;
        if (value === uninitialized) {
            panic("access before initialization");
        } else {
            return value;
        }
    }
    
    set current(newValue: T) {
        if (this.value === uninitialized) {
            this.value = newValue;
        } else {
            panic("'current' can only be assigned once.");
        }
    }
}

export function WriteOnceRef<T>(): Ref<T> {
    return new WriteOnceRefImpl;
};
