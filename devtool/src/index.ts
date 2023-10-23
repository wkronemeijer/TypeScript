import { pathToFileURL } from "url";
import { lstatSync } from "fs";
import { resolve } from "path";
import { inspect } from "util";

import { swear } from "./(Commons)/Assert";

import { InternalPackage } from "./(Domain)/Internal/InternalPackage";
import { enableDryRun } from "./(Domain)/DryRunning";

export function main(args: string[]): void {
    const dir = resolve(args[0] ?? ".");
    swear(lstatSync(dir).isDirectory(), () =>
        `${pathToFileURL(dir).href} is not a directory (that exists).`);
    const pkg = new InternalPackage(dir);
    
    console.log(inspect(pkg));
    
    enableDryRun();
}
