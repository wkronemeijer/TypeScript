import { terminal } from "@wkronemeijer/system";

import { JSDOM } from "jsdom";

import { DocumentAnalysis_print } from "./Domain/DocumentAnalysis#toString";
import { Document_analyze } from "./Domain/Document#analyze";
import { fetchHtml } from "./Domain/FetchHtml";
import { Region } from "./Domain/Region";

const TitanfallStatusUrl = `http://titanfall.p0358.net/status`;
const MyRegion: Region = "Europe";

export async function main(args = process.argv.slice(2)): Promise<void> {
    process.stdout.write("\x1B[30mLoading...");
    const html     = await fetchHtml(TitanfallStatusUrl);
    process.stdout.write("done\x1B[0m\n");
    const document = new JSDOM(html).window.document;
    const analysis = Document_analyze(document, MyRegion);
    DocumentAnalysis_print(analysis);
}
