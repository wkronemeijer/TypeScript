import { Directory } from "@wkronemeijer/system-node";

import { printDiaryStatistics } from "./Domain/PrintStatistics";

export function main(args: string[]): void {
    const dir = new Directory(args[0] ?? ".");
    printDiaryStatistics(dir);
}
