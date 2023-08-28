import { Directory, File, StringBuildable, StringBuilder, swear } from "@wkronemeijer/system";
import { DateTime } from "luxon";

import { WeekDay, WeekDay_fromDateTime } from "./WeekDay";
import { NoteSheafPath_tryMatch } from "./NoteSheafPath";

/////////////////
// Note object //
/////////////////

export interface NoteSheaf 
extends StringBuildable {
    readonly date: DateTime;
    readonly weekDay: WeekDay;
    
    getContents(): string;
}

interface NoteSheafConstructor {
    new(root: Directory, file: File): NoteSheaf;
}

export const NoteSheaf
:            NoteSheafConstructor
= class      NoteSheafImpl 
implements   NoteSheaf, StringBuildable {
    readonly date: DateTime;
    readonly weekDay: WeekDay;
    
    constructor(
        readonly root: Directory,
        readonly file: File,
    ) {
        const match = NoteSheafPath_tryMatch(root.to(file));
        swear(match, `Expected '${file}' to match the daily note pattern.`);
        this.date    = DateTime.fromObject(match);
        this.weekDay = WeekDay_fromDateTime(this.date);
    }
    
    getContents(): string {
        return this.file.readText(); // Slow 🤢
    }
    
    ///////////////
    // Stringify //
    ///////////////
    
    buildString(result: StringBuilder): void {
        result.append("NoteSheaf(");
        result.append(this.date.toLocaleString(DateTime.DATE_FULL));
        result.append(")");
    }
    
    toString(): string {
        return StringBuilder.stringify(this);
    }
}
