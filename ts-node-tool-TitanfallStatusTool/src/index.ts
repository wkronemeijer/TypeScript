import {DocumentAnalysis_format, Document_analyze} from "./Domain/DocumentAnalysis";
import {StringBuilder} from "@wkronemeijer/system";
import {fetchHtml} from "./Domain/FetchHtml";
import {GameMode} from "./Domain/Mode";
import {Region} from "./Domain/Region";
import {JSDOM} from "jsdom";

///////////////////
// Configuration //
///////////////////

const TitanfallStatusUrl = `http://titanfall.p0358.net/status`;

const DesiredRegions: Iterable<Region> = [
    "Europe",
    "America",
];

const DesiredGameModes: Iterable<GameMode> = [
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

function erase(string: string) : void {
    process.stdout.write("\r");
    process.stdout.write(' '.repeat(string.length));
    process.stdout.write("\r");
}

function currentHourMinutes() {
    return new Date().toLocaleTimeString("en-UK", { 
        hour: "2-digit", 
        minute: "2-digit",
        // second: "2-digit",
    });
}

//////////
// Main //
//////////

export async function main(): Promise<void> {
    const loading = "Loading...";
    write(loading);
    const html = await fetchHtml(TitanfallStatusUrl);
    erase(loading);
    const document = new JSDOM(html).window.document;
    const analysis = Document_analyze(document);
    const formattedAnalysis = new StringBuilder();
    DocumentAnalysis_format(analysis, formattedAnalysis, DesiredRegions, DesiredGameModes);
    write(formattedAnalysis.toString());
    write(`\x1b[3m(as of ${currentHourMinutes()})\x1b[23m`);
}
