// TODO: Should this be moved to ansi-console?

import {stdin, stdout} from "process";

const bufferEncoding: BufferEncoding = "utf-8";

/** 
 * Reads a single line from `stdin`. 
 * 
 * If you are creating a interactive CLI app, 
 * look into the `readline` node module.
 * */
export function readLine(prompt?: string): Promise<string> {
    return new Promise(resolve => {
        if (prompt !== undefined) {
            stdout.write(prompt);
        }
        stdin.resume();
        stdin.once("data", buffer => {
            stdin.pause();
            resolve(buffer.toString(bufferEncoding));
        });
    });
}
