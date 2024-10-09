import {printThrowable} from "@wkronemeijer/system";

/** Wrapper to run main, meant for `bin.js`. */
export async function startProgram(
    main: (args: string[]) => unknown,
    args: Iterable<string> = process.argv.slice(2),
): Promise<undefined | Error> {
    try {
        await main([...args]);
    } catch (e) {
        printThrowable(e);
        if (e instanceof Error) {
            return e;
        } else {
            return new Error(String(e));
        }
    }
    return undefined;
}
