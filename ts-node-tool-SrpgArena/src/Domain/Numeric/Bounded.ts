import { clamp } from "@wkronemeijer/system";

export class BoundedNumber {
    readonly value: number;
    
    constructor(
        value: number,
        readonly minimum: number = -Infinity,
        readonly maximum: number = Infinity,
    ) {
        this.value = clamp(minimum, value, maximum);
    }
    
    valueOf() {
        return this.value;
    }
    
    add(other: BoundedNumber) {
        
    }
}
