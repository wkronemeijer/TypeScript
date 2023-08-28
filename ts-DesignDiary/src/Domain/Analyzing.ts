import { Map_increment, Map_update, String_isWhitespace, from, negate, pluralize, singularize, terminal } from "@wkronemeijer/system";

import { NoteSheaf } from "./NoteSheaf";
import { WeekDay } from "./WeekDay";
import { DateTime } from "luxon";

// TODO: Cache this thing for a given date.
interface NoteCollectionInsights {
    /** Number of notes in this bundle. */
    readonly noteCount: number;
    /** Number of non-empty lines in this bundle. */
    readonly lineCount: number;
    /** Number of words (sequences of not-whitespace) in this bundle. */
    readonly wordCount: number;
}

function NoteCollectionInsights_empty(): NoteCollectionInsights {
    return {
        noteCount: 0,
        lineCount: 0,
        wordCount: 0,
    }
}

function NoteCollectionInsights_join(self: NoteCollectionInsights, other: NoteCollectionInsights): NoteCollectionInsights {
    return {
        noteCount: self.noteCount + other.noteCount,
        lineCount: self.lineCount + other.lineCount,
        wordCount: self.wordCount + other.wordCount,
    };
}

function String_isNotEmpty(self: string): boolean {
    return (
        self.length > 0 &&
        self.trim().length > 0
    );
}

const notePattern = /(==>|###|>>>|===)/g; // taken from desdia-highlighter

function NoteSheaf_analyze(note: NoteSheaf): NoteCollectionInsights {
    const contents = note.getContents();
    
    const noteCount = from(contents.matchAll(notePattern)).count();
    
    const lines     = contents.split('\n').filter(String_isNotEmpty);
    const lineCount = lines.length;
    
    const words     = contents.split(' ').filter(String_isNotEmpty);
    const wordCount = words.length;
    
    // muh efficiency
    // gc hates me probably
    
    return { noteCount, lineCount, wordCount, };
}

/*
Big Q: do days where I don't write count?
Because they will drag down all the averages. 



 */

interface NotebookInsights {
    /** The date of the oldest bundle in this notebook. */
    readonly oldestNoteDate: DateTime;
    /** The date of the newest bundle in this notebook. */
    readonly newestNoteDate: DateTime;
    
    /** The number of bundles in this notebook. */
    readonly bundleCount: number;
    
    readonly total: NoteCollectionInsights;
    readonly totalInsightsByWeekDay: ReadonlyMap<WeekDay, NoteCollectionInsights>;
}

function NotebookInsights_mapThingy(
    self: Map<WeekDay, NoteCollectionInsights>, 
    weekDay: WeekDay, 
    newInsights: NoteCollectionInsights,
): void {
    Map_update(self, weekDay, NoteCollectionInsights_empty, oldInsights => NoteCollectionInsights_join(oldInsights, newInsights));
}

export function Notebook_analyze(notes: readonly NoteSheaf[]): NotebookInsights {
    const bundleCount = notes.length;
    let totalNoteCount = 0;
    let totalLineCount = 0;
    let totalWordCount = 0;
    
    let wordCountByWeekDay = new Map<WeekDay, number>;
    
    let oldestNoteDate = DateTime.now();
    let newestNoteDate = DateTime.fromObject({ year: 2000 });
    
    for (const note of notes) {
        const analysis = terminal.measureTime(`Analyze ${note.toString()}`, () => {
            return NoteSheaf_analyze(note);
        });
        
        totalNoteCount += analysis.noteCount;
        totalLineCount += analysis.lineCount;
        totalWordCount += analysis.wordCount;
        
        Map_increment(wordCountByWeekDay, note.weekDay);
        
        oldestNoteDate = note.date < oldestNoteDate ? note.date : oldestNoteDate;
        newestNoteDate = note.date > newestNoteDate ? note.date : newestNoteDate;
    }
    
    const duration = newestNoteDate.diff(oldestNoteDate, "days").days;
    terminal.dumpLocals({ newestNoteDate, oldestNoteDate, duration });
    
    const weeklyAverageWordCount = totalWordCount / duration;
    const averageWordCountByDay;
    
    return {
        bundleCount,
        
        oldestNoteDate, 
        newestNoteDate,
        
        totalNoteCount,
        totalLineCount,
        totalWordCount,
        
        weeklyAverageWordCount,
        averageWordCountByDay,
    };
}
