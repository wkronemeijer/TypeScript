// Real tests use something like mocha.js or something.
// But why use tried and tested software, when you roll something yourself?
// Even better: we always compile them
// Even _even_ better: we look like another library, but with different semantics

/*

This stuff is so old, its hilarious
uses plain `enum`
tracks level in the log, instead of using buildstring
passes a logging function to each leaf 😶

There is:
Bundle -> Collection -> Test
specify
assert.equals
it




*/

import { AugmentedLoggingFunction } from "../IO/Terminal";
import { Record_toFunction } from "../Collections/Record";
import { notImplemented, panic } from "../Errors/ErrorFunctions";
import { StringEnum } from "../Data/Textual/StringEnum";
import { Member } from "../Data/Enumeration";
import { assert } from "../Assert";
import { Tally } from "../Data/Tally";

/////////////////
// Test result //
/////////////////

enum TestResult {
    Unknown = "?",
    Fail    = "✗",
    Pass    = "✓",
}

type  TestStatus = Member<typeof TestStatus>;
const TestStatus = StringEnum([
    "toBeDecided",
    "failed",
    "passed",
]);

export const TestStatus_toSymbol = Record_toFunction<TestStatus, string>({
    toBeDecided: "?",
    failed: "✗",
    passed: "✓",
});

///////////////
// Testables //
///////////////

type TestBody = () => Promise<void> | void;

interface Testable {
    run(): Promise<void>;
    summarize(tally: Tally<TestResult>): void;
    report(log: AugmentedLoggingFunction, level: number): void;
    // with StringBuilder, this becomes: stringify(StringBuilder): void;
}

const indent = ' '.repeat(4);

class TestInstance implements Testable {
    private result = TestResult.Unknown;
    private failReason = "";
    
    constructor(
        public readonly name: string,
        public readonly body: TestBody,
    ) { }
    
    async run(): Promise<void> {
        try {
            await this.body();
            this.result = TestResult.Pass;
        } catch (error) {
            if (error instanceof Error) {
                this.result     = TestResult.Fail;
                this.failReason = error.toString();
            } else throw error; // Throw a proper error next time.
        }
    }
    
    summarize(tally: Tally<TestResult>): void {
        tally.add(this.result);
    }
    
    report(log: AugmentedLoggingFunction, level: number): void {
        const { name, result, failReason } = this;
        
        const message = `${result} ${name}` + (result === TestResult.Fail ? ` (${failReason})` : ``);
        const output = indent.repeat(level) + message;
        
        log(output);
    }
}

class TestCollection implements Testable {
    private readonly children = new Array<Testable>();
    
    constructor(public readonly name: string) { }
    
    /////////////////////////////
    // Collection of testables //
    /////////////////////////////
    
    add(test: Testable): void {
        this.children.push(test);
    }
    
    clear() {
        // Clear the array, without re-assigning the field.
        this.children.length = 0;
    }
    
    //////////////
    // Testable //
    //////////////
    
    async run(): Promise<void> {
        for (const child of this.children) {
            await child.run();
        }
    }
    
    summarize(tally: Tally<TestResult>): void {
        this.children.forEach(child => child.summarize(tally));
    }
    
    report(log: AugmentedLoggingFunction, level: number): void {
        const message = `${this.name}:`;
        const output = indent.repeat(Math.max(level, 0)) + message;
        
        log(output);
        
        for (const child of this.children) {
            child.report(log, level + 1);
        }
    }
}

interface ItFunction {
    (name: string, task: TestBody): void;
}

const rootContext = new TestCollection("(root)");
let currentGlobalContext: TestCollection = rootContext;

/**
 * Executes the body in a local test context. 
 * Useful for grouping test cases.
 * 
 * AKA `withContext`.
 */
/*
Fun development note:
    VSC treats .spec files in a special way:
    you can't auto-import `describe` in these files, 
    because it gives you a dumb error message suggesting you want to use a test runner.

    In 99/100 cases this would make sense, 
    but what's annoying is that it removes the ability to auto-import.
    
    Actually, this is out-of-date.
    Nowdays it imports describe from node:tests (since Node 20)
    (I'm running Node 16 😳)
    
    Another update: node:test is kinda whatever, but it doesn't have a web version.
    Even worse, it exports an `it` variable. `test` is taken too 🤬
*/
export function specify(name: string, body: (it: ItFunction) => void): void {
    const  parentContext = currentGlobalContext;
    const currentContext = new TestCollection(name);
    parentContext.add(currentContext);
    
    currentGlobalContext = currentContext;
    body((name, task) => currentContext.add(new TestInstance(name, task)));
    currentGlobalContext = parentContext;
}

export function it(name: string, body: TestBody): void {
    notImplemented();
}

export const expect = new class ExpectImplementation {
    equals<T>(actual: T, expected: T): void {
        
    }
    
    throws(
        body: () => unknown, 
        validateError: (e: Error) => boolean = e => e instanceof Error,
    ): void {
        try {
            body();
            panic(`body failed to throw`);
        } catch (_) {
            
        }
    }
};

///////////////////
// Running tests //
///////////////////

// Enum cause we need an ordering
export enum TestReportDetail { 
    NoReport = 0,
    ReportOnError,
    SummarizeAndReportOnError,
    SummarizeAndAlwaysReport,
}

interface TestReportDetail2 {
    readonly report?: boolean | "onError";
    readonly summarize?: boolean;
}

export async function runTests(log: AugmentedLoggingFunction, detail: TestReportDetail): Promise<boolean> {
    // Running
    const start = Date.now();
    await rootContext.run();
    const end = Date.now();
    
    // Summarizing
    const tally = new Tally<TestResult>();
    rootContext.summarize(tally);
    assert(tally.count(TestResult.Unknown) === 0, `Some tests were not ran.`);
    
    const passed = tally.count(TestResult.Pass);
    const failed = tally.count(TestResult.Fail);
    const total  = passed + failed;
    
    const summary = `Ran ${total} tests in ${end - start}ms: ${passed} passed, ${failed} failed.`;
    
    // Reporting
    
    if (detail >= TestReportDetail.SummarizeAndReportOnError) {
        log(summary); 
    }
    
    if (
        (failed > 0 && detail > TestReportDetail.NoReport) ||
        (detail === TestReportDetail.SummarizeAndAlwaysReport)
    ) {
        rootContext.report(log, -1); // Start at -1, so root doesn't add unnecessary indentation.
        log(summary); 
    }
    
    // Cleanup
    rootContext.clear();
    
    return failed === 0;
}
/*

What do we need?

- specify
- register
- (start)run
- results(SoFar)
- Waiting for all tests is...not a good idea?

One problem:
How do we register the tests for System?
It doesn't have access to the file system...

 */
