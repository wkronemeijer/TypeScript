const {
    random,
    sign, abs,
    min, max,
    pow, sqrt,
    floor, ceil, trunc, round,
    sin, cos, tan, atan2,
    fround, imul,
    log, log10, log2,
    exp, 
    E, PI,
} = Math;

const TAU = 2 * PI;

// Lowercase
const e   = E;
const pi  = PI;
const tau = TAU;
// Greek (only if you are a unicode masochist)
const π = PI;
const τ = TAU;

/** Returns the natural logarithm. */
const ln = log;
/** Returns the binary logarithm. */
const lb = log2;

/** Returns 10 raised to the power. */
function exp10(power: number): number {
    return 10 ** power;
}

/** Returns 2 raised to the power. */
function exp2(power: number): number {
    return 2 ** power;
}

export {
    random,
    sign, abs,
    min, max,
    pow, sqrt,
    floor, ceil, trunc, round,
    sin, cos, tan, atan2,
    fround, imul,
    log, log10, log2, ln, lb,
    exp, exp10, exp2,
    
    E, PI, 
    e, pi, tau, 
    π, τ
};
