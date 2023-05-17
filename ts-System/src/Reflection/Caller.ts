// Analogous to System.Runtime.CompilerServices

import { AbsolutePath } from "../IO/Path";
import { panic } from "../Errors/ErrorFunctions";
import { File } from "../IO/FileSystemEntity";

type CallStackFormatter = NonNullable<typeof Error.prepareStackTrace>;
type CallStack          = Parameters<CallStackFormatter>[1];
type CallSite           = CallStack[number];

/** Returns the callsite of "your caller". 
 * 
 * Position parameter is for helper functions. Direct calls should use 2 (the default), helper functions should use 3.
 */
export function getCallSite(
    /** 
    [0] = getCallSite  
    [1] = the caller (who wants to know who called /him/)
    [2] = the caller's caller (the target)
    */
    offset = 0
): CallSite {
    let callsite: CallSite;
    
    const formatter = ((_: Error, stack: CallStack) => stack) satisfies CallStackFormatter;
    const temp = Error.prepareStackTrace;
    Error.prepareStackTrace = formatter;
    {
        const error = new Error();
        const stack = (
            error.stack as any as ReturnType<typeof formatter>
        ).slice();
        
        callsite = stack[2 + offset] ?? 
            panic(`Call stack is not deep enough.`)
        ;
    }
    Error.prepareStackTrace = temp;
    
    return callsite;
}

const fileScheme = "file:";
// TODO: Do some polyfill magic that makes it so the following line never errors
const fileURLToPath: (url: string) => string = require("url").fileURLToPath;

function normalizePath(urlOrPath: string): AbsolutePath {
    // let callerPath: string;
    // try {
    //     // I know that the 
    //     callerPath = fileURLToPath(urlOrPath);
    // } catch (e) {
    //     // wasn't a url after all 
    //     // (mjs gives you a url, cjs gives you a path)
    //     callerPath = urlOrPath;
    // }
    // return callerPath as AbsolutePath;
    return (urlOrPath.startsWith(fileScheme) ? 
        fileURLToPath(urlOrPath) : 
        urlOrPath
    ) as AbsolutePath;
}

/** Returns the absolute path to where the code resides that called you. */
export function getCallerPath(offset = 0): AbsolutePath {
    // [0] = getCallSite  
    // [1] = getCallerFile
    // [2] = the caller (who wants to know who called /him/)  
    // [3] = the caller's caller (the target)
    const targetCallsite = getCallSite(1 + offset); 
    const urlOrPath = targetCallsite.getFileName() ?? panic("No file name.");
    return normalizePath(urlOrPath);
}

/** 
 * Returns the file where the code resides that called you. 
 * 
 * Consider using {@link getCallerPath} if you only need the path.
 */
export function getCallerFile(offset = 0): File {
    return new File(getCallerPath(1 + offset));
}
