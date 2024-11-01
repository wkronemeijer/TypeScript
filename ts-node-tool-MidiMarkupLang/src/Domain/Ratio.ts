import {EquatableObject} from "@wkronemeijer/system";

export interface Ratio extends EquatableObject {
    /** Value "above" the dividing line. */
    readonly numerator: number;
    /** 
     * Value "below" the dividing line. 
     * 
     * Invariant: this is never 0
     */
    readonly denominator: Exclude<number, 0>; // awww
    
    /** Additive inverse of this value. */
    readonly opposite: Ratio;
    /** Multiplicative inverse of this value. */
    readonly reciprocal: Ratio;
    
    plus(other: Ratio): Ratio;
    minus(other: Ratio): Ratio;
    times(other: Ratio): Ratio;
    slash(other: Ratio): Ratio;
    
    valueOf(): number;
    toString(): string;
    toNumber(): number;
}

interface RatioConstructor {
    new(): Ratio;
    new(numerator: number): Ratio;
    new(numerator: number, denominator: number): Ratio;
    
    zero: Ratio;
    one: Ratio;
}

export const Ratio
:            RatioConstructor 
= class      RatioImpl 
implements   Ratio {
    
    readonly denominator: Exclude<number, 0>;
    
    
    constructor(        
        readonly numerator: number = 0,
        denominator: number = 1,
    ) {
        this.denominator = denominator;
    }
    
    
    
    toNumber(): number {
        return this.numerator / this.denominator
    }
    
}


declare const r: Ratio;

console.log(+r * 4)
