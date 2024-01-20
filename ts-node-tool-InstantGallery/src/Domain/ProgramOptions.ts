import { Directory } from "@wkronemeijer/system-node";

import { CSSProperties } from "react";

import { SortMode } from "./SortMode";

export type ObjectFit = NonNullable<CSSProperties["objectFit"]>;

export interface ProgramOptions {
    readonly targetDirectory: Directory;
    readonly mediaLimit: number;
    readonly port: number;
    readonly sort: SortMode;
}

export function ProgramOptions(args: string[]): ProgramOptions | Error {
    // Hardcoded for now.
    // Kind of want to write a CLI parser for system-node
    // Heyyy, now that is a good use-case for expanding that.
    // Do note that I should somehow make 
    // Create a program called update-index?
    return {
        targetDirectory: new Directory("."),
        mediaLimit: 100,
        port: 8080,
        sort: "shuffle",
    };
}
