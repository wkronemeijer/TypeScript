import { getDescriptiveName } from "../Data/GetName";

export function check<
    TActual,
    const TExpected extends TActual
>(
    actual: TActual,
    expected: TExpected,
): asserts actual is TExpected {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, actual: ${actual}`);
    }
}

type HasInstanceCheck<T> = 
    | {
        new(...args: any[]): T;
        [Symbol.hasInstance](x: unknown): boolean;
    }
    | { [Symbol.hasInstance](x: unknown): x is T }
;

check.is = function instanceOf<E>(
    actual: unknown, 
    expectedChecker: HasInstanceCheck<E>,
): asserts actual is E {
    if(!(actual instanceof (expectedChecker as any))) {
        const expectedName = getDescriptiveName(expectedChecker);
        const actualName   = getDescriptiveName(actual);
        throw new Error(`Expected instance of ${expectedName}, actual: ${actualName}.`);
    }
}

check.matches = function matchesRegexp(
    actual: string,
    expectedPattern: RegExp,
): void {
    if (!expectedPattern.test(actual)) {
        throw new Error(`Expected ${actual} to match ${expectedPattern}.`);
    }
}
