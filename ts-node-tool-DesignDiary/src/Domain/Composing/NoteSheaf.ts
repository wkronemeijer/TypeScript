import { DateTime } from "luxon";

import { ComparableObject, Ordering, StringBuildable, StringBuilder, compare, isInteger, swear } from "@wkronemeijer/system";
import { Directory, File, RelativePath } from "@wkronemeijer/system-node";

import { WeekDay, WeekDay_fromDateTime } from "../WeekDay";

const pathPattern = /(?<year>\d{4})(\/|\\)(?<month>\d{2})(\/|\\)(?<day>\d{2})\.dd/;

interface parsePath_Match {
    /** 4 digits */
    readonly year: number;
    /** 1-12 */
    readonly month: number;
    /** 1-31 */
    readonly day: number;
}

function parsePath(
    path: RelativePath
): parsePath_Match | undefined {
    const match = pathPattern.exec(path);
    if (match && match.groups) {
        const year  = Number(match.groups["year"]);
        const month = Number(match.groups["month"]);
        const day   = Number(match.groups["day"]);
        swear(isInteger(year * month * day)); // muh validation
        return { year, month, day };
    }
}

export class NoteSheaf 
implements StringBuildable, ComparableObject {
    readonly date: DateTime;
    readonly weekDay: WeekDay;
    
    private constructor(
        readonly root: Directory,
        readonly file: File,
        match : parsePath_Match,
    ) {
        this.date    = DateTime.fromObject(match);
        this.weekDay = WeekDay_fromDateTime(this.date);
    }
    
    static new(root: Directory, file: File): NoteSheaf | undefined {
        const match = parsePath(root.to(file));
        if (match)  {
            return new NoteSheaf(root, file, match);
        }
    }
    
    getContents_async(): Promise<string> {
        return this.file.readText_async();
    }
    
    ///////////////////////////
    // implements Comparable //
    ///////////////////////////
    
    compare(other: this): Ordering {
        return compare(this.date.valueOf(), other.date.valueOf());
    }
    
    ////////////////////////////////
    // implements StringBuildable //
    ////////////////////////////////
    
    buildString(result: StringBuilder): void {
        result.append("NoteSheaf(");
        result.append(this.date.toLocaleString(DateTime.DATE_FULL));
        result.append(")");
    }
    
    toString(): string {
        return StringBuilder.stringify(this);
    }
}
