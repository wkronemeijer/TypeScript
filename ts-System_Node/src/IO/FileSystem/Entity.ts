// Handle the file system like a set of objects using FileSystemObject
// then use the type narrowing functions to perform specific functionality.

import { Printable, Queue, panic } from "@wkronemeijer/system";

import { Stats, readFileSync, writeFileSync, lstatSync, readdirSync, openSync, closeSync, mkdirSync } from "fs";

import { AbsolutePath, Path_resolve, Path_getDetails, Path_join, Path_changeExtension, RelativePath, Path_getParent, AnyPath, Path_relative, Path_hasDescendant, Path_isRoot, Path_CurrentDirectory, Path_addSuffixExtension } from "./Path";

const encoding: BufferEncoding = "utf-8"; 

/** Partial enumeration of the kinds of file entities. */
export type FileSystemEntity_Kind = 
    | "file"
    | "directory"
;

/////////////////
// File entity //
/////////////////
// File | Directory would be cool; but the typing of it would be a pain
// fun project someday tho
// bonus point for including relative paths

/** Models an entity in the file system. All operations are synchronous. */
export class FileSystemEntity implements Printable {
     /** The path to this entity. */
    readonly path: AbsolutePath;
    
    constructor(...pathSegments: AnyPath[]) {
        this.path = Path_resolve(...pathSegments);
    }
    
    /** The name of this entity, without any extension. */
    get name(): string {
        return Path_getDetails(this.path).name;
    }
    
    /** The name of this file, _including_ extension. */
    get fullName(): string {
        return Path_getDetails(this.path).base;
    }
    
    /** The extension of this file. **Includes a leading `.`**. */
    get extension(): string {
        return Path_getDetails(this.path).ext;
    }
    
    /** Parent entity to this entity. */
    get parent(): Directory {
        return new FileSystemEntity(Path_getParent(this.path));
    }
    
    /** Whether this entity is the root (of the drive). */
    get isRoot(): boolean {
        return Path_isRoot(this.path);
    }
    
    static cwd(this: unknown): Directory {
        return new Directory(Path_CurrentDirectory);
    }
    
    /** Joins the path to this entity's path, and returns an entity pointing to the result. */
    join(...pathSegments: AnyPath[]): FileSystemEntity {
        return new FileSystemEntity(Path_join(this.path, ...pathSegments));
    }
    
    /** Returns the relative path to get from this entity to the target entity.
     * 
     * Interesting side note, this is like `flip (-)` in a way. Given paths 
     * `parent = /one/two` and `child = /one/two/three`, the following holds:  
     * > `parent.to(child) == child.from(parent) == "three"`
     */
    to(target: FileSystemEntity): RelativePath {
        return Path_relative(this.path, target.path);
    }
    
    /** Changes the extension of this entity's path, and returns an entity pointing to the result. `newExtension` should include a '`.`'. */
    changeExtension(ext: string): FileSystemEntity {
        return new FileSystemEntity(Path_changeExtension(this.path, ext));
    }
    
    addSuffix(extension: string): FileSystemEntity {
        return new FileSystemEntity(Path_addSuffixExtension(this.path, extension));
    }
    
    /** Returns detailed statistics about this entity. */
    getStats(): Stats | undefined {
        try {
            return lstatSync(this.path);
        } catch (e) {
            return undefined;
        }
    }
    
    /** Returns whether or not this entity exists. */
    exists(): boolean {
        return this.getStats() !== undefined;
    }
    
    /**Returns the type if this entity exists, `undefined` otherwise. */
    getKind(): FileSystemEntity_Kind | undefined {
        const stats = this.getStats();
        switch (true) {
            case stats?.isFile()     : return "file";
            case stats?.isDirectory(): return "directory";
            default                  : return undefined;
        }
    }
    
    /** Returns whether this entity exists and is a file. */
    isFile(): boolean {
        return this.getKind() === "file";
    }
    
    /** Returns whether this entity exists and is a directory. */
    isDirectory(): boolean {
        return this.getKind() === "directory";
    }
    
    /////////////////////
    // File operations //
    /////////////////////
    
    /** Reads the entire contents of this file as a UTF-8 encoded string. */
    readText(): string {
        return readFileSync(this.path, { encoding });
    }
    
    /** Writes a UTF-8 encoded string to this file. */
    writeText(s: string): void {
        writeFileSync(this.path, s, { encoding });
    }
    
    
    ////////////////////
    // Touching 👉👈 //
    ////////////////////
    
    touchFile(): void {
        let fd;
        try {
            fd = openSync(this.path, "a");
        } finally {
            if (fd) {
                closeSync(fd);
            }
        }
    }
    
    touchDirectory(): void {
        mkdirSync(this.path, { recursive: true });
    }
    
    //////////////////////////
    // Directory operations //
    //////////////////////////
    
    hasChild(file: File): boolean {
        return Path_hasDescendant(this.path, file.path);
    }
    
    hasDirectChild(file: File): boolean {
        return this.path === file.parent.path;
    }
    
    /** Reads this directory, and returns an entity list of its contents. */
    *readContents(): Iterable<FileSystemEntity> {
        try {
            for (const filename of readdirSync(this.path)) {
                yield this.join(filename);
            }
        } catch (e) {
            return;
        }
    }
    
    /** Iterates recursively through all files in this directory and its subdirectories. */
    *recursiveGetAllFiles(): Iterable<File> {
        const dirQueue: Queue<File> = [this];
        
        while (dirQueue.length !== 0) {
            const dir = dirQueue.shift() ?? panic();
            for (const entity of dir.readContents()) {
                const type = entity.getKind();
                if (type === "directory") {
                    dirQueue.push(entity);
                } else if (type === "file") {
                    yield entity;
                }
            }
        }
    }
    
    ////////////////
    // Interfaces //
    ////////////////
    
    /** Object override. */
    toString() { return this.path }
}

//////////////
// Synonyms //
//////////////
// Goal: Communicate intent with these aliases 

/** Models a file in the file system. All operations are synchronous. */
export const File = FileSystemEntity;
export type  File = FileSystemEntity;

/** Models a directory in the file system. All operations are synchronous. */
export const Directory = FileSystemEntity;
export type  Directory = FileSystemEntity;

/** Models a file or a directory in the file system. All operations are synchronous. */
export const FileOrDirectory = FileSystemEntity;
export type  FileOrDirectory = FileSystemEntity;
