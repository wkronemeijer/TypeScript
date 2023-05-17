import { assert } from "../Assert";


export interface Ref<T> {
    readonly value: T;
}

export interface MutableRef<T> extends Ref<T> {
    value: T;
}

//////////////
// Lazy ref //
//////////////

class LazyRef<T> implements Ref<T> {
    private isAssigned = false;
    private realValue!: T;
    
    constructor() {
        // For v8's hidden class
        (this.realValue as any) = undefined;
    }
    
    get value(): T {
        assert(this.isAssigned, "Lazy reference was accessed before it was assigned a value.");
        return this.realValue;
    }
    
    set value(newValue: T) {
        this.isAssigned = true;
        this.realValue  = newValue;
    }
}

export function Ref_create<T>(): Ref<T> {
    return new LazyRef;
}

/////////////
// Factory //
/////////////


