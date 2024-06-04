import {Member, StringEnum} from "@wkronemeijer/system";

export type  GameMode = Member<typeof GameMode>;
export const GameMode = StringEnum([
    "All", 
    "Attrition", 
    "Campaign", 
    "Coop", 
    "LTS", 
    "CTF", 
    "Private match", 
    "Other", 
    "Private lobby", 
    "Training", 
]);
