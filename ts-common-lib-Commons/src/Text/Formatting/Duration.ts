import { assert, requires } from "../../Assert";


// yeah CAPITAL_STYLE is ugly, but these are not "normal" constants.
const MILLISECONDS =     1;
const SECONDS      = 1_000 * MILLISECONDS;
const MINUTES      =    60 * SECONDS;
const HOURS        =    60 * MINUTES;

const scales    = [MILLISECONDS, SECONDS, MINUTES, HOURS, Infinity];
const scaleName = [        "ms",     "s",   "min",   "h",    "inf"];
assert(scales.length === scaleName.length);

/** Formats a time span in milliseconds into a human readable time duration string. */
export function humanizeDuration(timespan: number): string {
    requires(timespan >= 0, "Duration must be positive.");
    
    // Find scale so that our number is less than the next step.
    let chosenScale = 0;
    for (let i = 1; i < scales.length; i++) {
        if (timespan < scales[i]!) {
            chosenScale = i - 1;
            break;
        }
    }
    
    // Format and print
    return `${Math.trunc(timespan / scales[chosenScale]!)}${scaleName[chosenScale]}`;
}
