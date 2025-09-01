import * as fs  from "fs";
import * as fs_async from "fs/promises";

import {AbsolutePath, Path_join, Path_relative} from "./Path";
import {FileSystem, FileSystemDirectoryEntry} from "./FileSystem";
import {FileEntityStats} from "./EntityStats";
import {FileEntityKind} from "./EntityKind";

const EncodingOptions = {
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

function normalizeDirents(
    parentPath: AbsolutePath, 
    dirents: readonly fs.Dirent[],
): FileSystemDirectoryEntry[] {
    /*
    Here's the thing:
    dirent's path depends on the type of path passed to readdir/readdirSync;
    Using an absolute path (which we always do) returns something as follows:
        const path = "C:/My/Cool/Path"
        const dirent = {
            name: "MyFile.png",
            path: "C:/My/Cool/Path/Folder/Subfolder",
        }
    When the actual file path is "C:/My/Cool/Path/Folder/Subfolder/MyFile.png", 
    and the relative path we want to return is "Folder/Subfolder/MyFile.png".
    */
    return dirents.map(dirent => {
        const kind       = FileEntityKind_infer(dirent);
        const descendant = Path_join(AbsolutePath(dirent.parentPath), dirent.name);
        const location   = Path_relative(parentPath, descendant);
        return { kind, location };
    });
}

export const ActualFileSystem: FileSystem = {
    description: "node:fs",
    
    getStats({path}) {
        return FileEntityStats_fromStats(fs.statSync(path));
    },
    
    async getStats_async({path}) {
        return FileEntityStats_fromStats(await fs_async.stat(path));
    },
    
    getLinkStats({path}) {
        return FileEntityStats_fromStats(fs.lstatSync(path));
    },
    
    async getLinkStats_async({path}) {
        return FileEntityStats_fromStats(await fs_async.lstat(path));
    },
    
    readFile({path}) {
        return fs.readFileSync(path, EncodingOptions);
    },
    
    async readFile_async({path}) {
        return await fs_async.readFile(path, EncodingOptions);
    },
    
    readFileBytes({path}) {
        return fs.readFileSync(path);
    },
    
    async readFileBytes_async({path}) {
        return (await fs_async.readFile(path)) as NonSharedBuffer;
    },
    
    touchFile({path}) {
        let fd;
        try {
            fd = fs.openSync(path, "a");
        } finally {
            if (fd !== undefined) {
                fs.closeSync(fd);
            }
        }
    },
    
    async touchFile_async({path}) {
        let handle;
        try {
            handle = await fs_async.open(path, "a");
        } finally {
            if (handle !== undefined) {
                await handle.close();
            }
        }
    },
    
    writeFile({path, content}) {
        fs.writeFileSync(path, content, EncodingOptions);
    },
    
    async writeFile_async({path, content}) {
        await fs_async.writeFile(path, content, EncodingOptions);
    },
    
    readDirectory({path, recursive}) {
        return normalizeDirents(path, fs.readdirSync(path, { 
            recursive, 
            withFileTypes: true,
        }));
    },
    
    async readDirectory_async({path, recursive}) {
        return normalizeDirents(path, await fs_async.readdir(path, { 
            recursive, 
            withFileTypes: true,
        }));
    },
    
    touchDirectory({path}) {
        fs.mkdirSync(path, {recursive: true});
    },
    
    async touchDirectory_async({path}) {
        await fs_async.mkdir(path, {recursive: true});
    }
};
