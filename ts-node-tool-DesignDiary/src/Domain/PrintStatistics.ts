import { terminal } from "@wkronemeijer/system";
import { Directory } from "@wkronemeijer/system-node";

import { NoteBook } from "./Composing/NoteBook";
import { NoteBookInsights } from "./Analyzing/NoteBookInsights";

export async function printDiaryStatistics_async(sourceDir: Directory): Promise<void> {
    const book     = await terminal.measureTime_async("compose()", () => NoteBook.new_async(sourceDir));
    const insights = await terminal.measureTime_async("analyze()", () => NoteBookInsights.new_async(book));
    
    console.log(insights);
}
