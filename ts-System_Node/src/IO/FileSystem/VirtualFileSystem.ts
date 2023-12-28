import { Case } from "@wkronemeijer/system";

import { FileSystem } from "./FileSystem";

interface VirtualFileSystemNode_Base {
    readonly lastModifiedMs: number;
}

type VirtualFileSystemNode = (
    | Case<"file", VirtualFileSystemNode_Base & {
        readonly content: string;
    }> 
    | Case<"directory", VirtualFileSystemNode_Base & {
        readonly children: readonly VirtualFileSystemNode[];
    }>
);

export const VirtualFileSystem: FileSystem = {
    name: "Virtual",
};
