import {StringBuilder, panic, singularize} from "@wkronemeijer/system";
import {GameMode} from "./Mode";
import {Region} from "./Region";

export interface RegionAnalysis {
    readonly region: Region;
    readonly playerCountByMode: ReadonlyMap<GameMode, number>;
    readonly regionalPlayerCount: number;
}

//////////////
// Analysis //
//////////////

const isGameMode = GameMode.hasInstance;

/*
Example table:
<table class="table-borderedd" style="padding: 8px; margin-top: 1em;" id="stats-table">
    <thead>
        <tr>
            <th class="text-center">Mode</th>
            <th class="text-center">Worldwide (PC)</th>
            <th class="text-center">Europe</th>
            <th class="text-center">America</th>
            <th class="text-center">Asia</th>
        </tr>
    </thead>
    <tbody class="text-center">
        <tr><td><strong>All</strong></td><td>7</td><td>7</td><td>0</td><td>0</td></tr>
        <tr><td><strong>Attrition</strong></td><td>7</td><td>7</td><td>0</td><td>0</td></tr>
        <tr><td><strong>Campaign</strong></td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        <tr><td><strong>Coop</strong></td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        <tr><td><strong>LTS</strong></td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        <tr><td><strong>CTF</strong></td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        <tr><td><strong>Private match</strong></td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        <tr><td><strong>Other</strong></td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        <tr><td><strong>Private lobby</strong></td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        <tr><td><strong>Training</strong></td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    </tbody>
</table>
*/

const TableId = "stats-table";
const ModeOffset = 0;

export function Document_analyzeRegion(self: Document, region: Region): RegionAnalysis {
    const table = self.getElementById(TableId) ?? panic("could not find table");
    
    // yeahhhhhh raw DOM manipulation 🥵
    const tableHead = table.getElementsByTagName("thead")[0] ?? panic("could not get thead");
    const headerRow = tableHead.children[0] ?? panic("could not get table header row");
    const regionOffset = (
        Array.from(headerRow.children)
        .map(element => element.textContent?.trim())
        .indexOf(region)
    );
    
    const tableBody = table.getElementsByTagName("tbody")[0] ?? panic("could not get tbody");
    const recordRows = (
        Array.from(tableBody.children)
        .map(element => 
            Array.from(element.children)
            .map(subelement => subelement.textContent)
        )
    );
    
    const playerCountByMode = new Map<GameMode, number>;
    
    for (const row of recordRows) {
        const mode  = row[ModeOffset];
        const count = Number(row[regionOffset]);
        
        if (isGameMode(mode) && isFinite(count)) {
            playerCountByMode.set(mode, count);
        }
    }
    
    const regionalPlayerCount = playerCountByMode.get("All") ?? 0;
    
    return {region, playerCountByMode, regionalPlayerCount};
}

////////////////
// Formatting //
////////////////

function formatRegion(f: StringBuilder, region: Region): void {
    f.append("\x1B[1m");
    
    f.append("Titanfall 1 playercount in ");
    f.append(region);
    
    f.append("\x1B[22m");
}

function formatModeCount(f: StringBuilder, mode: GameMode, count: number): void {
    f.append("\x1B[");
    f.append((
        count === 0 ? 31 : // Red
        count  <  4 ? 33 : // Yellow
        32                 // Green
    ).toString());
    f.append("m");
    
    f.append(mode);
    f.append(" has ");
    f.append(singularize(count, "players"));
    
    f.append("\x1B[39m");
}

export function RegionAnalysis_format(self: RegionAnalysis, f: StringBuilder, modes: Iterable<GameMode>): void {
    const {region, playerCountByMode} = self;
    
    formatRegion(f, region);
    f.appendLine();
    f.increaseIndent();
    for (const mode of modes) {
        const count = playerCountByMode.get(mode) ?? 0;
        formatModeCount(f, mode, count);
        f.appendLine();
    }
    f.decreaseIndent();
}
