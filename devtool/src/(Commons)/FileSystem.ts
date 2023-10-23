import { lstatSync, readdirSync } from "fs";
import { join, parse, resolve } from "path";

export function* getFiles_recursive(root: string): Iterable<string> {
    let current;
    const dirQueue = [root];
    
    while (current = dirQueue.shift()) {
        for (const fileName of readdirSync(current)) {
            const fileOrDir = resolve(current, fileName);
            const stat = lstatSync(fileOrDir);
            if (false) {
                // when
            } else if (stat.isFile()) {
                yield fileOrDir;
            } else if (stat.isDirectory()) {
                dirQueue.push(fileOrDir);
            }
        }
    }
}

export function removeExtension(file: string): string {
    const { dir, name } = parse(file);
    return join(dir, name);
}
