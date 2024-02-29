import { SyncAndAsync } from "@wkronemeijer/system";

import { AbsolutePath, RelativePath } from "./Path";
import { FileEntityStats } from "./EntityStats";
import { FileEntityKind } from "./EntityKind";

// Idea: use an options object for everything
// Considering the mess that is the node:fs api, 
// seems like good future proofing.

export interface FileSystemDirectoryEntry {
    readonly kind: FileEntityKind;
    readonly location: RelativePath;
}

export type FileSystem = SyncAndAsync<{
    readonly description: string;
    
    getStats(options: {
        readonly path: AbsolutePath;
    }): FileEntityStats;
    
    getLinkStats(options: {
        readonly path: AbsolutePath;
    }): FileEntityStats;
    
    readFile(options: {
        readonly path: AbsolutePath;
    }): string;
    
    touchFile(options: {
        readonly path: AbsolutePath;
    }): void;
    
    writeFile(options: {
        readonly path: AbsolutePath; 
        readonly content: string;
    }): void;
    
    readDirectory(options: {
        readonly path: AbsolutePath;
        readonly recursive?: boolean;
    }): FileSystemDirectoryEntry[];
    
    touchDirectory(options: {
        readonly path: AbsolutePath;
    }): void;
}>;
