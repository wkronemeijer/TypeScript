import { terminal } from "@wkronemeijer/system";
import { Directory } from "@wkronemeijer/system-node";

import { Notebook_compose } from "./NoteBook";
import { Notebook_analyze } from "./Analyzing";

export function printDiaryStatistics(sourceDir: Directory): void {
    const notes = terminal.measureTime("Compose notebook", () => {
        return Notebook_compose(sourceDir);
    });
    const insights = terminal.measureTime("Analyze notebook", () => {
        return Notebook_analyze(notes);
    });
    
    terminal.dumpLocals(insights as any);
}
