import { getDescriptiveName } from "../Data/GetName";
import { InstanceOwner } from "../Types/InstanceOwner";
import { equalsAny } from "../Traits/Equatable/Equals";
import { Falsy } from "../Types/Truthy";

const { isNaN } = Number;

export function SameValueZero(a: unknown, b: unknown): boolean {
    return ((a === b) || (isNaN(a) && isNaN(b)));
}

export const check = 
/** Checks actual equals expected, using the "SameValueZero" algorithm. */
function checkBuiltinEquals<TActual, const TExpected extends TActual>(
    actual: TActual,
    expected: TExpected,
): asserts actual is TExpected {
    if (!SameValueZero(actual, expected)) {
        throw new Error(`Expected '${expected}', actual: '${actual}'`);
    }
}

check.same = 
/** Checks actual is the same value as expected, using the "SameValueZero" algorithm. */
function checkBuiltinEquals<TActual, const TExpected extends TActual>(
    actual: TActual,
    expected: TExpected,
): asserts actual is TExpected {
    if (!SameValueZero(actual, expected)) {
        throw new Error(`Expected ${actual} to be the same as '${expected}'.`);
    }
}

check.equals = 
/** Checks actual equals expected, using `equals`. */
function checkExtensibleEquals<TActual, const TExpected extends TActual>(
    actual: TActual,
    expected: TExpected,
): asserts actual is TExpected {
    if (!equalsAny(actual, expected)) {
        throw new Error(`Expected ${expected}, actual: ${actual}`);
    }
};

check.instanceOf = 
/** Checks whether the value is actually an instance of the given instanceOwner. */
function checkInstanceOf<E>(
    actual: unknown, 
    expectedInstanceOwner: InstanceOwner<E>,
): asserts actual is E {
    if(!(actual instanceof (expectedInstanceOwner as any))) {
        const expectedName = getDescriptiveName(expectedInstanceOwner);
        const actualName   = getDescriptiveName(actual);
        throw new Error(`Expected instance of ${expectedName}, actual: ${actualName}.`);
    }
}

check.is = check.instanceOf;

////////////////
// Primitives //
////////////////


check.ok  = 
function checkIsTrue(value: unknown): asserts value {
    if (!value) {
        throw new Error(`Expected '${value}' to be truthy.`);
    }
};

check.notOk = 
function checkIsFalse(value: unknown): asserts value is Falsy {
    if (value) {
        throw new Error(`Expected '${value}' to be falsy.`);
    }
};

check.isDefined = 
function checkIsDefined<T>(value: T): asserts value is Exclude<T, undefined> {
    if (value === undefined) {
        throw new Error(`Expected value to be defined.`);
    }
};

check.isUndefined =
/** Checks the argument is undefined. */
function checkIsUndefined(value: unknown): asserts value is undefined {
    if (value !== undefined) {
        throw new Error(`Expected '${value}' to be undefined.`);
    }
};



////////////////////
// Matches regexp //
////////////////////

// TODO: what should we do with global regexps?

check.matches = function matchesRegexp(
    actual: string,
    expectedPattern: RegExp,
): void {
    if (!expectedPattern.test(actual)) {
        throw new Error(`Expected '${actual}' to match ${expectedPattern}.`);
    }
}

//////////////
// Throwing //
//////////////

check.throws = 
/** Checks if the given function throws anything, including non-Error values. */
function checkThrows(throwingFunc: () => unknown): void {
    try {
        throwingFunc();
    } catch {
        return;
    }
    
    throw new Error(`Expected function to throw.`);
}

check.throwsInstanceOf = 
/** Checks if the given function throws an instance of the given instance owner. */
function checkThrowsInstanceOf<TError extends Error>(
    errorOwner: InstanceOwner<TError>,
    throwingFunc: () => unknown,
): void {
    try {
        throwingFunc();
    } catch (actualError) {
        check.instanceOf(actualError, errorOwner);
        return;
    }
    
    throw new Error(`Expected function to throw.`);
}
