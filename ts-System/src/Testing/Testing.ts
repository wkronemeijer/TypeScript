// Real tests use something like mocha.js or something.
// But why use tried and tested software, when you roll something yourself?
// Even better: we always compile them
// Even _even_ better: we look like another library, but with different semantics

/*
Time to expand this with: we can bundle all files into an index.ts, well, than we can also bundle 


*/

import { Tally } from "../Tally";
import { assert } from "../Assert";
import { AugmentedLoggingFunction } from "../IO/Terminal";


/////////////////
// Test result //
/////////////////

enum TestResult {
    Unknown = "?",
    Fail    = "✗",
    Pass    = "✓",
}

///////////////
// Testables //
///////////////

type TestBody = () => Promise<void> | void;

interface Testable {
    run(): Promise<void>;
    summarize(tally: Tally<TestResult>): void;
    report(log: AugmentedLoggingFunction, level: number): void
}

const indent = ' '.repeat(4);

class TestInstance implements Testable {
    result = TestResult.Unknown;
    failReason = "";
    
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
*/
export function specify(name: string, body: (it: ItFunction) => void): void {
    const  parentContext = currentGlobalContext;
    const currentContext = new TestCollection(name);
    parentContext.add(currentContext);
    
    currentGlobalContext = currentContext;
    body((name, task) => currentContext.add(new TestInstance(name, task)));
    currentGlobalContext = parentContext;
}

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
