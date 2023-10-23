import { pathToFileURL } from "url";
import { writeFileSync } from "fs";
import { resolve } from "path";

let isDryRun = false;

export function enableDryRun(): void {
    isDryRun = true;
}

const enableBold = "\x1B[1m";
const reset = "\x1B[0m";

/** `writeFileSync`, but it might just be a dry run. */
export function virtualWriteFile(file: string, content: string): void {
    file = resolve(file);
    
    if (!isDryRun) {
        writeFileSync(file, content, "utf-8");
    } else {
        const fileUri = pathToFileURL(file);
        console.log(`${enableBold}Write target:${reset} ${fileUri}`);
        console.log(`${enableBold}Write content:${reset}`);
        console.log(content);
    }
}
