////////////////
// Sort order //
////////////////

export type  SortOrder = (typeof SortOrder_Values)[number];
export const SortOrder_Values = [
    "ascending",
    "descending",
] as const;
export const SortOrder_Default: SortOrder = "ascending";
