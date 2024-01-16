import { Array_firstElement, Array_lastElement, from } from "@wkronemeijer/system";

import { SetOfNotesInsights } from "./SetOfNotesInsights";
import { NoteSheafInsights } from "./NoteSheafInsights";
import { NoteSheaf } from "../Composing/NoteSheaf";
import { NoteBook } from "../Composing/NoteBook";
import { WeekDay } from "../WeekDay";

export class NoteBookInsights {
    readonly insightsByWeekDay: ReadonlyMap<WeekDay, SetOfNotesInsights>;
    readonly oldestNote: NoteSheaf | undefined;
    readonly newestNote: NoteSheaf | undefined;
    readonly total: SetOfNotesInsights;
    readonly count: number;
    
    constructor(
        readonly book: NoteBook,
        insights: readonly NoteSheafInsights[],
    ) {
        this.total = SetOfNotesInsights.join(
            from(insights)
            .select(sheaf => sheaf.insights)
        );
        this.count = this.total.sources.length;
        
        this.insightsByWeekDay = (
            from(WeekDay)
            .associateWith(day => SetOfNotesInsights.join(
                from(insights)
                .selectWhere(sheaf => 
                    sheaf.source.weekDay === day &&
                    sheaf.insights
                )
            ))
            .toMap()
        );
        
        this.oldestNote = Array_firstElement(book.sheaves);
        this.newestNote = Array_lastElement(book.sheaves);
    }
    
    static async new_async(book: NoteBook): Promise<NoteBookInsights> {
        return new NoteBookInsights(book, await Promise.all(
            from(book)
            .select(NoteSheafInsights.new_async)
        ));
    }
}
