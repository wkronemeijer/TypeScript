import { Directory } from "@wkronemeijer/system-node";

import { printDiaryStatistics_async } from "./Domain/PrintStatistics";

export async function main(args: string[]): Promise<void> {
    const dir = new Directory(args[0] ?? ".");
    await printDiaryStatistics_async(dir);
}
