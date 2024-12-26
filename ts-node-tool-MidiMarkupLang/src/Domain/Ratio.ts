import {abs, ComparableObject, EquatableObject, gcd, Ordering, sign, swear} from "@wkronemeijer/system";

export interface Ratio extends EquatableObject, ComparableObject {
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
    
    readonly zero: Ratio;
    readonly one: Ratio;
}

export const Ratio
:            RatioConstructor 
= class      RatioImpl 
implements   Ratio {
    readonly numerator: number;
    readonly denominator: number;
    
    constructor(a: number = 0, b: number = 1) {
        swear(b !== 0, "denominator can not be 0");
        const finalSign = sign(a / b);
        a = abs(a); 
        b = abs(b); 
        const divisor = gcd(a, b);
        a /= divisor;
        b /= divisor;
        this.numerator   = finalSign * a;
        this.denominator =             b;
    }
    
    static readonly zero = new RatioImpl(0);
    static readonly one  = new RatioImpl(1);
    
    get opposite(): Ratio {
        throw 1;
    }
    
    get reciprocal(): Ratio {
        const {numerator: a, denominator: b} = this;
        return new RatioImpl(b, a);
    }
    
    plus(other: Ratio): Ratio {
        const {numerator: a1, denominator: b1} = this;
        const {numerator: a2, denominator: b2} = other;
        return new RatioImpl(
            a1 * b2 + a2 * b1,
            b1 * b2,
        );
    }
    
    minus(other: Ratio): Ratio {
        const {numerator: a1, denominator: b1} = this;
        const {numerator: a2, denominator: b2} = other;
        return new RatioImpl(
            a1 * b2 - a2 * b1,
            b1 * b2,
        );
    }
    
    times(other: Ratio): Ratio {
        const {numerator: a1, denominator: b1} = this;
        const {numerator: a2, denominator: b2} = other;
        return new RatioImpl(
            a1 * a2,
            b1 * b2,
        );
    }
    
    slash(other: Ratio): Ratio {
        const {numerator: a1, denominator: b1} = this;
        const {numerator: a2, denominator: b2} = other;
        return new RatioImpl(
            a1 * b2,
            b1 * a2,
        );
    }
    
    equals(other: this): boolean {
        const {numerator: a1, denominator: b1} = this;
        const {numerator: a2, denominator: b2} = other;
        return (
            a1 === a2 &&
            b1 === b2
        );
    }
    
    compare(other: this): Ordering {
        const {numerator: a1, denominator: b1} = this;
        const {numerator: a2, denominator: b2} = other;
        return Ordering(a1 * b2 - a2 * b1);
    }
    
    toNumber(): number {
        return this.numerator / this.denominator
    }
    
    toString(): string {
        if (this.numerator) {
            return `${this.numerator}/${this.denominator}`;
        } else {
            return '0';
        }
    }
    
    valueOf(): number {
        return this.toNumber();
    }
}


declare const r: Ratio;

console.log(+r * 4)
