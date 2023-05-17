import { guard, requires } from "../../Assert";

///////////
// Types //
///////////

class Fraction {
    constructor(
        public readonly   numerator: number,
        public readonly denominator: number,
    ) {
        guard(denominator !== 0);
    }
    
    toNumber(): number {
        return this.numerator / this.denominator;
    }
    
    toArray(): [number, number] {
        return [this.numerator, this.denominator];
    }
    
    toString(): string {
        return `${this.numerator} / ${this.denominator}`;
    }
    
    get isProper(): boolean {
        return this.numerator <= this.denominator;
    }
    
    get reciprocal(): Fraction {
        return new Fraction(this.denominator, this.numerator);
    }
}

const frac = (p: number, q: number) => new Fraction(p, q);

//////////////////
// Calculations //
//////////////////

// Source material: https://www.johndcook.com/blog/2010/10/20/best-rational-approximation/
// https://hg.python.org/cpython/file/822c7c0d27d1/Lib/fractions.py#l211
// https://stackoverflow.com/questions/95727/how-to-convert-floats-to-human-readable-fractions

/** Enumerates simple fractions */
export function* possibleFractions(limit: number): IterableIterator<Fraction> {
    const fractions = new Array<Fraction>();
    
    fractions.push(frac(1, 1));
    
    // NB: <=
    for (let q = 1; q <= limit; q++) {
        for (let p = 1; p < q; p++) {
            yield frac(p, q);
        }
    }
}

function approximateProperFraction(goalFraction: Fraction, limit: number): Fraction {
    requires(goalFraction.isProper);
    
    // Minimize this function
    const error = (frac: Fraction) => Math.abs(goalFraction.toNumber() - frac.toNumber());
    
    let currentBest: Fraction = frac(1, 1); 
    for (const candidate of possibleFractions(limit)) {
        // Simple(r) fractions come first, so < will make sure we skip multiples
        if (error(candidate) < error(currentBest)) {
            currentBest = candidate;
        }
    }
    
    return currentBest;
}

function approximateFraction(fraction: Fraction, limit: number): Fraction {
    if (fraction.isProper) {
        return approximateProperFraction(fraction, limit);
    } else {
        return approximateProperFraction(fraction.reciprocal, limit).reciprocal;
    }
}

/////////////
// Exports //
/////////////

interface HumanizeRatioParameters {
    numerator: number;
    numeratorSuffix?: string;
    ratioSeperator?: string;
    denominator: number;
    denominatorSuffix?: string;
    limit?: number;
}

export function humanizeRatio(parameters: HumanizeRatioParameters): string {
    const {
        numerator: complexNumer,
        numeratorSuffix: numerSuffix = "",
        ratioSeperator: seperator = ":",
        denominator: complexDenom,
        denominatorSuffix: denomSuffix = "",
        limit = 100,
    } = parameters;
    
    const { 
        numerator: numer, 
        denominator: denom,
    } = approximateFraction(frac(complexNumer, complexDenom), limit);
    
    return `${numer}${numerSuffix} ${seperator} ${denom}${denomSuffix}`;
}
