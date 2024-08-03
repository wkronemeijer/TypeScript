import {getDescriptiveName} from "../Data/Names/GetName";
import {InstanceOwner} from "../Data/InstanceOwner";
import {SameValueZero} from "../SameValueZero";
import {equalsAny} from "../Traits/Eq/Equatable";
import {Falsy} from "../Types/Truthy";

type errorConstructor = new(message: string, options?: ErrorOptions) => Error;

// The core interface
interface AssertionFunction {
    (value: unknown): asserts value;
}

interface ExtendedAssertionFunction {
    (value: unknown): asserts value;
    (value: unknown, message: string): asserts value;
    readonly errorConstructor: errorConstructor;
}

/////////////////////////////////
// Assertion function subtypes //
/////////////////////////////////

interface EqualsAssertionFunction {
    <TActual, const TExpected extends TActual>(
        actual: TActual,
        expected: TExpected,
    ): asserts actual is TExpected;
}

interface InstanceOfAssertionFunction {
    <E>(
        actual: unknown, 
        expectedInstanceOwner: InstanceOwner<E>,
    ): asserts actual is E;
}

interface TrueAssertionFunction {
    (value: unknown): asserts value;
}

interface FalseAssertionFunction {
    <T>(value: T): asserts value is Extract<T, Falsy>;
}

interface UndefinedAssertionFunction {
    (value: unknown): asserts value is undefined;
}

interface DefinedAssertionFunction {
    <T>(value: T): asserts value is Exclude<T, undefined>;
}

interface RegExpAssertionFunction {
    (
        actual: string,
        expectedPattern: RegExp,
    ): void;
    // Something tells me one day TS will support regeces in the type system.
}

interface ThrowsAssertionFunction {
    (throwingFunc: () => unknown): void
}

interface ThrowsInstanceOfAssertionFunction {
    // Flipped order to be more readable.
    <TError extends Error>(
        errorOwner: InstanceOwner<TError>,
        throwingFunc: () => unknown,
    ): void;
}

interface OkAssertionFunction {
    <T>(value: T): asserts value is Exclude<T, Error>;
}

interface ErrorAssertionFunction {
    <T>(value: T): asserts value is Extract<T, Error>;
}

interface PolishedAssertionFunction {
    (value: unknown, message?: string): asserts value;
    
    /** Uses SameValueZero. */
    readonly areIdentical: EqualsAssertionFunction;
    readonly areEqual: EqualsAssertionFunction;
    
    readonly isInstanceOf: InstanceOfAssertionFunction;
    
    readonly isTrue: TrueAssertionFunction;
    readonly isFalse: FalseAssertionFunction;
    
    // null isn't used that much in TS
    readonly isDefined: DefinedAssertionFunction;
    readonly isUndefined: UndefinedAssertionFunction;
    
    readonly throws: ThrowsAssertionFunction;
    readonly throwsInstanceOf: ThrowsInstanceOfAssertionFunction;
    
    readonly matchesPattern: RegExpAssertionFunction;
    
    // isOk does something radically different than ok, which seems like a bad idea.
    readonly isOk: OkAssertionFunction;
    readonly isError: ErrorAssertionFunction;
    
    /** @deprecated Use isEqual */
    readonly equals: EqualsAssertionFunction;
    /** @deprecated Use isIdentical*/
    readonly same: EqualsAssertionFunction;
    /** @deprecated Use isInstanceOf */
    readonly is: InstanceOfAssertionFunction;
    /** @deprecated Use isInstanceOf */
    readonly instanceOf: InstanceOfAssertionFunction;
    /** @deprecated Use isTrue */
    readonly ok: TrueAssertionFunction;
    /** @deprecated Use isFalse */
    readonly notOk: FalseAssertionFunction;
    
    /** @deprecated */
    readonly matches: RegExpAssertionFunction;
}

// export declare const check2: PolishedAssertionFunction;

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

check.areIdentical = check.same;

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

check.areEqual = check.equals;

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

check.is           = check.instanceOf;
check.isInstanceOf = check.instanceOf;

////////////////
// Primitives //
////////////////

check.ok  = 
function checkIsTrue(value: unknown): asserts value {
    if (!value) {
        throw new Error(`Expected '${value}' to be truthy.`);
    }
};

check.isTrue = check.ok;

check.notOk = 
function checkIsFalse(value: unknown): asserts value is Falsy {
    if (value) {
        throw new Error(`Expected '${value}' to be falsy.`);
    }
};

check.isFalse = check.notOk;

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

check.matches = function matchesRegExp(
    actual: string,
    expectedPattern: RegExp,
): void {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test
    // > JavaScript RegExp objects are stateful when they have the **global** or **sticky** flags set
    if (expectedPattern.global) {
        throw new Error(`Pattern must be non-global.`);
    }
    
    if (expectedPattern.sticky) {
        throw new Error(`Pattern must be non-sticky.`);
    }
    
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
