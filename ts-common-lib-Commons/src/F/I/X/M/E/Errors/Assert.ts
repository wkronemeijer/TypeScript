/////////////////////////////////////
// >>>                         <<< //
// >>> NO IMPORTS IN THIS FILE <<< //
// >>>                         <<< //
/////////////////////////////////////

// Motivation: 
//     if (!condition) {
//         throw new Error("Super long message");
//     }
// can get very verbose, so this helper function hopefully shortens it to
//     assert(condition, Error, "Super long message");
// at the very least it's more readable.
// even better if we just drop the message entirely.
//     assert(condition);

/////////////////////////
// Assertion functions //
/////////////////////////

/** A simple error message. */
type Message     = string;
/** A lazy error message, for when computing the error string is expensive. */
type LazyMessage = () => string;
/** A constructor for errors, with a room for a message. */
type UnaryErrorConstructor = new (message: Message) => Error;

/* Theory for `isOk` is sound
Just a question of: what do we do with `requires` and `ensures`?
I think they are cute, but was is the functional difference with `swear`?
"pre" or "post", they are still programmer bugs.
guard is exception, swear is error. 

Also means that guard should always have an error message
since it is user-facing.

swear(1 + 1 === 2) is meaningful
guard(1 + 1 === 2) is not.

swear.isOk is meaningful
guard.isOk is too

thing with adding more of these, is that 
they cause a wild growth of "useful" assertion functions.
`isOk` is not like that. 

*/

// TypeScript requires us to explicitly type values with an assertion guard, 
// so we extract all the overloads to this interface.
// Also good to put some dev comments on these essential functions.
/** All overloads of our assertion function. */
export interface AssertionFunction {
    /** Asserts its first argument is `true`, otherwise throws an error. */
    (shouldBeTrue: unknown): asserts shouldBeTrue;
    /** Asserts its first argument is `true`, otherwise throws an error with the specified message. */
    (shouldBeTrue: unknown, assertMessage: Message): asserts shouldBeTrue;
    /** Asserts its first argument is `true`, otherwise throws an error with the specified computed message. */
    (shouldBeTrue: unknown, assertMessage: LazyMessage): asserts shouldBeTrue;
    /** Asserts its first argument is `true`, otherwise throws an error using the provided constructor. */
    (shouldBeTrue: unknown, errorConstructor: UnaryErrorConstructor): asserts shouldBeTrue;
    /** Asserts its first argument is `true`, otherwise throws an error using the provided constructor, with the specified message. */
    (shouldBeTrue: unknown, errorConstructor: UnaryErrorConstructor, errorMessage: Message): asserts shouldBeTrue;
    /** Asserts its first argument is `true`, otherwise throws an error using the provided constructor, with the specified computed message. */
    (shouldBeTrue: unknown, errorConstructor: UnaryErrorConstructor, errorMessage: LazyMessage): asserts shouldBeTrue;
}

function isUnaryErrorConstructor(candidate: unknown): candidate is UnaryErrorConstructor {
    return (
        typeof candidate === "function" && 
        candidate.prototype instanceof Error
    );
    // Can't check length because it is not inherited. (:?)
    // arrow functions have no prototype property
    // normal functions have Object as prototype.constructor
    // open for better methods
}

function unlazy(producer: Message | LazyMessage | undefined): string | undefined{
    return (typeof producer === "function") ? producer() : producer;
}

/** Creates a new assertion function, with new defaults for the error type and message. */
export function AssertionFunction(
    defaultErrorConstructor: UnaryErrorConstructor, 
    defaultErrorMessage    : string,
): AssertionFunction {
    return function __assert(
        shouldBeTrue: unknown,
        argument1?  : Message | LazyMessage | UnaryErrorConstructor,
        argument2?  : Message | LazyMessage,
    ): asserts shouldBeTrue {
        if (!shouldBeTrue) {
            let constructor: UnaryErrorConstructor;
            let message    : string               ;
            
            if (isUnaryErrorConstructor(argument1)) {
                constructor = argument1;
                message     = unlazy(argument2) ?? defaultErrorMessage;
            } else {
                constructor = defaultErrorConstructor;
                message     = unlazy(argument1) ?? defaultErrorMessage;
            }
            
            // This comment exist to not make me feel bad over the empty line above.
            throw new constructor(message);
        }
    }
}

//////////////////////////////////
// Standard assertion functions //
//////////////////////////////////

/** General assertion function for unrecoverable errors. */
export const assert: AssertionFunction = AssertionFunction(Error, "Assertion failed.");

/** 
 * General assertion function for unrecoverable errors. 
 * 
 * Rename of `assert`, so it doesn't conflict with `console.assert` (which lacks the assertion type). */
export const swear: AssertionFunction = assert;

/** Assertion function for pre-conditions. */
export const requires: AssertionFunction = AssertionFunction(Error, "Pre-condition was not met.");

/** Assertion function for post-conditions. */
export const ensures: AssertionFunction = AssertionFunction(Error, "Post-condition was not met.");

/** Assertion which are not checked. For readability. */
export const __unsafeAssert: AssertionFunction = () => {};
