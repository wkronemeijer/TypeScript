import { File, TestReportDetail, runTests, terminal } from "@wkronemeijer/system";

const testModules = new Array<() => void>;

export function registerTestBundle(name = "Tests.generated.ts") {
    
}

// Originally there was an idea 
export function runRegisteredTests() {
    runTests(terminal.log, TestReportDetail.ReportOnError);
    // I USED AN NUMBER ENUM?
    // AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
}

/*

Alright, progress:
- Testing for Node is just dynamically importing the Tests.generated.ts file to register.
- Testing for Web consists of creating 2 entrypoints (main.js and test.js), and then dynamically importing the second file.
Running tests is the same. 

we need to test if relative imports are preserved when called from another file. 
If we can, then we have:
- Tests not loaded if not run
- In seperate files
- Automatically bundled
- Centrally run
- On both platforms


As for Webpack needing static imports: we have 2 entrypoints, and both of those don't contain any dynamism in them. 

Next up: naming this stuff

 */
