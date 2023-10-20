import { panic } from "@wkronemeijer/system";

import { GameMode } from "./Mode";
import { Region } from "./Region";
import { DocumentAnalysis } from "./DocumentAnalysis";

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

export function Document_analyze(self: Document, region: Region): DocumentAnalysis {
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
    
    const playerCountByGameMode = new Map<GameMode, number>;
    
    for (const row of recordRows) {
        const mode  = row[ModeOffset];
        const count = Number(row[regionOffset]);
        
        if (isGameMode(mode) && isFinite(count)) {
            playerCountByGameMode.set(mode, count);
        }
    }
    
    const totalPlayerCount = playerCountByGameMode.get("All") ?? 0;
    
    return { region, playerCountByGameMode, totalPlayerCount };
}
