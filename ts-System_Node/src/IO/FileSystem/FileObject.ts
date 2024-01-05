import { AsyncMethods, from } from "@wkronemeijer/system";

import { AnyPath, Path_CurrentDirectory } from "./Path";
import { FileEntityStats } from "./EntityStats";
import { FileEntityKind } from "./EntityKind";
import { GetFileSystem } from "./GetFileSystem";
import { PathObject } from "./PathObject";

interface FileObjectSyncMethods {
    // TODO: decide
    // here's the thing: checking for exists...and then getting the kind is silly
    // Cache it then erase with setTimeout?
    // Causes a lot of these objects to just stick around
    // WeakRef? finalize? We are just digging the pit deeper...
    getStats(): FileEntityStats | undefined;
    getLinkStats(): FileEntityStats | undefined;
    
    getKind(): FileEntityKind | undefined;
    exists(): boolean;
    isFile(): boolean;
    isDirectory(): boolean;
    
    touchFile(): void;
    touchDirectory(): void;
    
    readText(): string;
    writeText(value: string): void;
    
    readContents(): FileObject[];
    recursiveGetAllFiles(): FileObject[];
}

type FileObjectAsyncMethods = AsyncMethods<FileObjectSyncMethods>;

/** Present a wrapper around a path and shortcuts for common file operations.
 * File operations swallow errors and just return `mempty`.
 */
export interface FileObject extends PathObject, FileObjectSyncMethods, FileObjectAsyncMethods { }
// TODO: Maybe use Result<T, E> sometime?

interface FileObjectConstructor {
    new(...segments: AnyPath[]): FileObject;
    /** @deprecated Use `new(".")` instead. */
    cwd(): FileObject;
}

export const FileObject
:            FileObjectConstructor 
= class      FileObjectImpl 
extends      PathObject
implements   FileObject {
    static cwd(): FileObject {
        return new FileObjectImpl(Path_CurrentDirectory);
    }
    
    ///////////////
    // Get stats //
    ///////////////
    
    getStats(): FileEntityStats | undefined {
        try {
            return GetFileSystem().getStats(this);
        } catch {
            return undefined;
        }
    }
    
    async getStats_async(): Promise<FileEntityStats | undefined> {
        try {
            return await GetFileSystem().getStats_async(this);
        } catch {
            return undefined;
        }
    }
    
    ////////////////////
    // Get link stats //
    ////////////////////
    
    getLinkStats(): FileEntityStats | undefined {
        try {
            return GetFileSystem().getLinkStats(this);
        } catch {
            return undefined;
        } 
    }
    
    async getLinkStats_async(): Promise<FileEntityStats | undefined> {
        try {
            return await GetFileSystem().getLinkStats_async(this);
        } catch {
            return undefined;
        } 
    }
    
    //////////////
    // Get kind //
    //////////////
    
    getKind(): FileEntityKind | undefined {
        return this.getStats()?.kind;
    }
    
    async getKind_async(): Promise<FileEntityKind | undefined> {
        return (await this.getStats_async())?.kind;
    }
    
    ////////////
    // Exists //
    ////////////
    
    exists(): boolean {
        return this.getStats() !== undefined;
    }
    
    async exists_async(): Promise<boolean> {
        return (await this.getStats_async()) !== undefined;
    }
    
    /////////////
    // Is file //
    /////////////
    
    isFile(): boolean {
        return this.getKind() === "file";
    }
    
    async isFile_async(): Promise<boolean> {
        return (await this.getKind_async()) === "file";
    }
    
    //////////////////
    // Is directory //
    //////////////////
    
    isDirectory(): boolean {
        return this.getKind() === "directory";
    }
    
    async isDirectory_async(): Promise<boolean> {
        return (await this.getKind_async()) === "directory";
    }
    
    ////////////////
    // Touch file //
    ////////////////
    
    touchFile(): void {
        try {
            GetFileSystem().touchFile(this);
        } catch {}
    }
    
    async touchFile_async(): Promise<void> {
        try {
            await GetFileSystem().touchFile_async(this);
        } catch {}
    }
    
    /////////////////////
    // Touch directory //
    /////////////////////
    
    touchDirectory(): void {
        try {
            GetFileSystem().touchDirectory(this);
        } catch {}
    }
    
    async touchDirectory_async(): Promise<void> {
        try {
            await GetFileSystem().touchDirectory_async(this);
        } catch {}
    }
    
    ///////////////
    // Read text //
    ///////////////
    
    readText(): string {
        return GetFileSystem().readFile(this);
    }
    
    async readText_async(): Promise<string> {
        return await GetFileSystem().readFile_async(this);
    }
    
    ////////////////
    // Write text //
    ////////////////
    
    writeText(value: string): void {
        try {
            GetFileSystem().writeFile({ 
                path: this.path, 
                content: value,
            });
        } catch {}
    }
    
    async writeText_async(value: string): Promise<void> {
        try {
            await GetFileSystem().writeFile_async({ 
                path: this.path, 
                content: value,
            });
        } catch {}
    }
    
    ///////////////////
    // Read contents //
    ///////////////////
    
    /** Reads this directory, and returns an entity list of its contents. */
    readContents(): FileObject[] {
        return (
            GetFileSystem()
            .readDirectory(this)
            .map(dirent => this.join(dirent.location))
        );
    }
    
    async readContents_async(): Promise<FileObject[]> {
        return (
            (await GetFileSystem()
            .readDirectory_async(this))
            .map(dirent => this.join(dirent.location))
        );
    }
    
    /////////////////////////////
    // Recursive get all files //
    /////////////////////////////
    
    recursiveGetAllFiles(): FileObject[] {
        return (
            from(GetFileSystem().readDirectory({
                path: this.path, 
                recursive: true,
            }))
            .selectWhere(dirent => 
                dirent.kind === "file" && 
                this.join(dirent.location)
            )
            .toArray()
        );
    }
    
    async recursiveGetAllFiles_async(): Promise<FileObject[]> {
        return (
            from(await GetFileSystem().readDirectory_async({
                path: this.path, 
                recursive: true,
            }))
            .selectWhere(dirent => 
                dirent.kind === "file" && 
                this.join(dirent.location)
            )
            .toArray()
        );
    }
}

//////////////
// Synonyms //
//////////////
// Goal: Communicate intent with these aliases 

/** Models a file in the file system. */
export type  File = FileObject;
export const File = FileObject;

/** Models a directory in the file system. */
export type  Directory = FileObject;
export const Directory = FileObject;

/** Models a file or a directory in the file system. */
export type  FileOrDirectory = FileObject;
export const FileOrDirectory = FileObject;
