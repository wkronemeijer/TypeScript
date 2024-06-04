import {Document_analyze} from "./Domain/DocumentAnalysis";
import {fetchDocument} from "./Domain/FetchHtml";
import {GameMode} from "./Domain/Mode";
import {Region} from "./Domain/Region";
import {swear} from "@wkronemeijer/system";

///////////////////
// Configuration //
///////////////////

const TitanfallStatusUrl = `http://titanfall.p0358.net/status`;

const MyRegions: Iterable<Region> = [
    "Europe",
    "America",
];

const MyModes: Iterable<GameMode> = [
    "Campaign",
    "Attrition",
    "Coop",
];

///////////////////////
// Writing to stdout //
///////////////////////

function write(string: string): void {
    process.stdout.write(string);
}

function erase(string: string): void {
    swear(!string.includes('\n'), "cannot erase multi-line strings");
    process.stdout.write('\r');
    process.stdout.write(' '.repeat(string.length));
    process.stdout.write('\r');
}

function currentHourMinutes() {
    return new Date().toLocaleTimeString("en-UK", { 
        hour: "2-digit", 
        minute: "2-digit",
    });
}

function styleCurrentTime(string: string): string {
    return `\x1b[3m${string}\x1b[23m`;
}

//////////
// Main //
//////////

export async function main(): Promise<void> {
    const loading = "Loading...";
    write(loading);
    const document = await fetchDocument(TitanfallStatusUrl);
    erase(loading);
    write(Document_analyze(document).toTable(MyRegions, MyModes));
    write(styleCurrentTime(`(as of ${currentHourMinutes()})`));
}
