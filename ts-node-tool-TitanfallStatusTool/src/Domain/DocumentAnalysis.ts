import {Document_analyzeRegion, RegionAnalysis} from "./RegionAnalysis";
import {StringBuilder} from "@wkronemeijer/system";
import {formatTable} from "./Table";
import {GameMode} from "./Mode";
import {Region} from "./Region";

interface DocumentAnalysis {
    readonly regions: readonly Region[];
    readonly analysisByRegion: ReadonlyMap<Region, RegionAnalysis>;
    
    getPlayerCount(region: Region, mode: GameMode): number;
}

//////////////
// Analysis //
//////////////

export function Document_analyze(self: Document): DocumentAnalysis {
    const regions = [...Region];
    const analysisByRegion = new Map<Region, RegionAnalysis>;
    for (const region of regions) {
        analysisByRegion.set(region, Document_analyzeRegion(self, region));
    }
    return {
        regions, 
        analysisByRegion, 
        getPlayerCount(region: Region, mode: GameMode) {
            return analysisByRegion.get(region)?.playerCountByMode.get(mode) ?? 0;
        },
    };
}

////////////////
// Formatting //
////////////////

function styleRegion(name: string): string {
    return `\x1b[1m${name}\x1b[22m`;
}

function styleMode(name: string): string {
    // return `\x1b[4m${name}\x1b[24m`;
    return name;
}

function stylePlayerCount(count: number): string {
    const code = (
        count === 0 ? 31 : // Red
        count  <  4 ? 33 : // Yellow
        32                 // Green
    );
    return `\x1b[${code}m${count}\x1b[39m`;
}

export function DocumentAnalysis_format(
    self: DocumentAnalysis, 
    f: StringBuilder, 
    regions: Iterable<Region>, 
    modes: Iterable<GameMode>,
): void {
    const table: string[][] = [];
    
    const header = ["×"];
    for (const region of regions) {
        header.push(styleRegion(region));
    }
    table.push(header);
    
    for (const mode of modes) {
        const row: string[] = [styleMode(mode)];
        for (const region of regions) {
            row.push(stylePlayerCount(self.getPlayerCount(region, mode)));
        }
        table.push(row);
    }
    
    formatTable(f, table);
}
