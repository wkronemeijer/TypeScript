import { from } from "@wkronemeijer/system";

import { NoteSheaf } from "../Composing/NoteSheaf";
import { SetOfNotesInsights } from "./SetOfNotesInsights";

const notePattern = /^(==>|###|>>>|===)/gm; // taken from desdia-highlighter
const wordPattern = /\w/;

const newline = '\n';
const space = ' ';

function isNotWhitespace(self: string): boolean {
    return (
        self.length > 0 &&
        self.trim().length > 0
    );
}

export class NoteSheafInsights {
    readonly insights: SetOfNotesInsights;
    
    constructor(
        readonly source: NoteSheaf,
        contents: string,
    ) {
        const notes = from(contents.matchAll(notePattern)).count();
        const lines = contents.split(newline).filter(isNotWhitespace).length;
        
        const rawSymbols = contents.split(space).filter(isNotWhitespace);
        const symbols = rawSymbols.length;
        const words = rawSymbols.filter(symbol => wordPattern.test(symbol)).length;
        
        this.insights = new SetOfNotesInsights({
            notes, lines, symbols, words, source,
        });
    }
    
    static async new_async(this: unknown, sheaf: NoteSheaf): Promise<NoteSheafInsights> {
        return new NoteSheafInsights(sheaf, await sheaf.getContents_async());
    }
}
