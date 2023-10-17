import { StringEnum } from "./Textual/StringEnum";
import { check } from "../Errors/Check";

/** 
 * A mutable reference to a value. 
 * 
 * Mutable by default as readonly is the default for arguments.
 */
export interface Ref<T> {
    value: T;
}

export function Ref<T>(value: T): Ref<T> {
    return { value };
}

/** 
 * A readonly reference to a value. 
 */
export interface ReadonlyRef<T> {
    readonly value: T;
}

//////////////
// Lazy ref //
//////////////

const WriteOnceRefState = StringEnum([
    "uninitialized",
    "initialized",
]);

class WriteOnceRef<T> 
implements Ref<T> {
    private state = WriteOnceRefState.default;
    private actualValue!: T;
    
    constructor() {
        // For v8's hidden class
        (this.actualValue as any) = null;
    }
    
    get value(): T {
        check.same(this.state, "initialized");
        return this.actualValue;
    }
    
    set value(newValue: T) {
        check.same(this.state, "uninitialized");
        this.actualValue = newValue;
        this.state = "initialized";
    }
}

Ref.writeOnce = function WriteOnce<T>(): Ref<T> {
    return new WriteOnceRef;
}
