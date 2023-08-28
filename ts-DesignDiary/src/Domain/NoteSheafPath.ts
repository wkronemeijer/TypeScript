import { RelativePath, swear } from "@wkronemeijer/system";

const { isInteger } = Number;

const NoteSheafPattern = /(?<year>\d{4})(\/|\\)(?<month>\d{2})(\/|\\)(?<day>\d{2})\.dd/;

interface NoteSheafPath_tryMatch_match {
    /** 4 digits */
    readonly year: number;
    /** 1-12 */
    readonly month: number;
    /** 1-31 */
    readonly day: number;
}

export function NoteSheafPath_tryMatch(
    path: RelativePath,
): NoteSheafPath_tryMatch_match | false {
    const match = NoteSheafPattern.exec(path);
    if (match && match.groups) {
        const year  = Number(match.groups["year"]);
        const month = Number(match.groups["month"]);
        const day   = Number(match.groups["day"]);
        swear(isInteger(year * month * day)); // muh validation
        return { year, month, day };
    } else {
        return false;
    }
}

export function NoteSheafPath_hasInstance(path: RelativePath): boolean {
    return NoteSheafPattern.test(path);
}
