import { Member, StringEnum } from "@wkronemeijer/system";

export type  Region = Member<typeof Region>;
export const Region = StringEnum([
    "Worldwide (PC)", 
    "Europe", 
    "America", 
    "Asia",
]);
