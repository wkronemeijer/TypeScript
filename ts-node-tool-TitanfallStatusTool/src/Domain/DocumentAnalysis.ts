import { GameMode } from "./Mode";
import { Region } from "./Region";

export interface DocumentAnalysis {
    readonly region: Region;
    readonly playerCountByGameMode: ReadonlyMap<GameMode, number>;
    readonly totalPlayerCount: number;
}
