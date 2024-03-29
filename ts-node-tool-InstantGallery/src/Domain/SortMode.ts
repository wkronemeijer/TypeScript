import { Array_shuffle, Member, StringEnum } from "@wkronemeijer/system";
import { Medium } from "./Medium";

export type  SortMode = Member<typeof SortMode>;
export const SortMode = StringEnum([
    "shuffle"
] as const);

export function SortMode_applySort(self: SortMode, files: Medium[]): void {
    if (self === "shuffle") {
        Array_shuffle(files);
    }
}
