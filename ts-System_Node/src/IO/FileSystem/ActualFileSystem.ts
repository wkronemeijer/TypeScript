import * as fs  from "node:fs";
import * as fs_async from "node:fs/promises";

import { FileEntityStats } from "./EntityStats";
import { FileEntityKind } from "./EntityKind";
import { RelativePath } from "./Path";
import { FileSystem } from "./FileSystem";

const encodingOptions = {
    encoding: "utf-8",
} satisfies fs.ObjectEncodingOptions;

function FileEntityKind_infer(stats: fs.Stats | fs.Dirent): FileEntityKind {
    switch (true) {
        case stats.isFile()        : return "file";
        case stats.isDirectory()   : return "directory";
        case stats.isSymbolicLink(): return "symlink";
        default                    : return "other";
    }
}

function FileEntityStats_fromStats(stats: fs.Stats): FileEntityStats {
    return {
        kind: FileEntityKind_infer(stats),
        lastModifiedMs: stats.mtimeMs,
    };
}

export const ActualFileSystem: FileSystem = {
    description: "node:fs",
    
    getStats({ path }) {
        return FileEntityStats_fromStats(fs.statSync(path));
    },
    
    async getStats_async({ path }) {
        return FileEntityStats_fromStats(await fs_async.stat(path));
    },
    
    getLinkStats({ path }) {
        return FileEntityStats_fromStats(fs.lstatSync(path));
    },
    
    async getLinkStats_async({ path }) {
        return FileEntityStats_fromStats(await fs_async.lstat(path));
    },
    
    readFile({ path }) {
        return fs.readFileSync(path, encodingOptions);
    },
    
    async readFile_async({ path }) {
        return await fs_async.readFile(path, encodingOptions);
    },
    
    touchFile({ path }) {
        let fd;
        try {
            fd = fs.openSync(path, "a");
        } finally {
            if (fd !== undefined) {
                fs.closeSync(fd);
            }
        }
    },
    
    async touchFile_async({ path }) {
        let handle;
        try {
            handle = await fs_async.open(path, "a");
        } finally {
            if (handle !== undefined) {
                await handle.close();
            }
        }
    },
    
    writeFile({ path, content }) {
        fs.writeFileSync(path, content, encodingOptions);
    },
    
    async writeFile_async({ path, content }) {
        await fs_async.writeFile(path, content, encodingOptions);
    },
    
    readDirectory({ path, recursive }) {
        return fs.readdirSync(path, { 
            recursive, 
            withFileTypes: true,
        }).map(dirent => ({ 
            kind: FileEntityKind_infer(dirent),
            location: RelativePath(dirent.name),
        }));
    },
    
    async readDirectory_async({ path, recursive }) {
        return (await fs_async.readdir(path, { 
            recursive, 
            withFileTypes: true,
        })).map(dirent => ({ 
            kind: FileEntityKind_infer(dirent),
            location: RelativePath(dirent.name),
        }));
    },
    
    touchDirectory({ path }) {
        fs.mkdirSync(path, { recursive: true });
    },
    
    async touchDirectory_async({ path }) {
        await fs_async.mkdir(path, { recursive: true });
    }
};
