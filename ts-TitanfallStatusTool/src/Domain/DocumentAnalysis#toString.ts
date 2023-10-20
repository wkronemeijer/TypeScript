import { singularize, terminal } from "@wkronemeijer/system";

import { DocumentAnalysis } from "./DocumentAnalysis";
import { GameMode } from "./Mode";

const DesiredGameModes = [
    "Campaign",
    "Coop",
    "Attrition",
] as const satisfies readonly GameMode[];

const maxLength = Math.max(...DesiredGameModes.map(mode => mode.length));

function players(count: number) {
    const color = (
        count === 0 ? 31 :
        count  <  4 ? 33 :
        32
    );
    return `\x1B[${color}m${singularize(count, "players")}\x1B[0m`;
}

// Until better ansi formatting functions are in place, we go directly to print
export function DocumentAnalysis_print(self: DocumentAnalysis): void {
    const { region, playerCountByGameMode } = self;
    
    const now = new Date().toLocaleTimeString("en-UK", { 
        hour: "2-digit", 
        minute: "2-digit",
        second: "2-digit",
    });
    
    terminal.log(`\x1B[1mTitanfall 1 playercount in ${region}\x1B[0m`);
    for (const mode of DesiredGameModes) {
        const playerCount = playerCountByGameMode.get(mode) ?? 0;
        terminal.log(`    ${mode.padEnd(maxLength)} ─ ${players(playerCount)}`);
    }
    terminal.info(`(as of ${now})`);
}
