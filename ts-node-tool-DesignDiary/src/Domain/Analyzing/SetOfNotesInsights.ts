import { ZeroOrMore, combine } from "@wkronemeijer/system";

import { NoteSheaf } from "../Composing/NoteSheaf";

interface SetOfNotesInsightsOptions {
    readonly notes?: number;
    readonly lines?: number;
    readonly symbols?: number;
    readonly words?: number;
    readonly source?: ZeroOrMore<NoteSheaf>;
}

export class SetOfNotesInsights {
    readonly notes: number;
    readonly lines: number;
    readonly symbols: number;
    readonly words: number;
    readonly sources: readonly NoteSheaf[];
    
    constructor(options?: SetOfNotesInsightsOptions) {
        this.notes   = options?.notes   ?? 0;
        this.lines   = options?.lines   ?? 0;
        this.symbols = options?.symbols ?? 0;
        this.words   = options?.words   ?? 0;
        
        this.sources = combine(options?.source);
    }
    
    static readonly default = new SetOfNotesInsights();
    
    plus(other: SetOfNotesInsights): SetOfNotesInsights {
        return new SetOfNotesInsights({
            notes:   this.notes   + other.notes  ,
            lines:   this.lines   + other.lines  ,
            symbols: this.symbols + other.symbols,
            words:   this.words   + other.words  ,
            source: [...this.sources, ...other.sources],
        });
    }
    
    static join(array: Iterable<SetOfNotesInsights>): SetOfNotesInsights {
        return (
            Array.from(array)
            .reduce((a, b) => a.plus(b), SetOfNotesInsights.default)
        );
    }
}
