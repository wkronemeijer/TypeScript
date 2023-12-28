// Handle the file system like a set of objects using FileSystemObject
// then use the type narrowing functions to perform specific functionality.

import { ExpandType, Printable, SyncAndAsync, from } from "@wkronemeijer/system";

import { AbsolutePath, Path_resolve, Path_getDetails, Path_join, Path_changeExtension, RelativePath, Path_getParent, AnyPath, Path_relative, Path_hasDescendant, Path_isRoot, Path_CurrentDirectory, Path_addSuffixExtension, Path_getExtension } from "./Path";
import { FileEntityKind } from "./EntityKind";
import { FileExtension } from "./Extension";
import { FileEntityStats } from "./FileEntityStats";
import { GetFileSystem } from "./GetFileSystem";

interface PathObjectLike {
    readonly path: AbsolutePath;
}

interface PathObject 
extends PathObjectLike, Printable {
    readonly dirname: AbsolutePath;
    readonly root: string;
    readonly name: string;
    readonly basename: string;
    readonly extname: FileExtension | "";
    
    readonly fullName: string;
    readonly extension: FileExtension | "";
    
    readonly parent: FileObject;
    readonly isRoot: boolean;
    
    join(...segments: readonly AnyPath[]): FileObject;
    to(other: PathObjectLike): RelativePath;
    
    addExtension(ext: FileExtension): FileObject;
    changeExtension(ext: FileExtension): FileObject ;
    removeExtension(): FileObject;
    addSuffix(extension: FileExtension): FileObject;
}

interface FileObjectMethods {
    getStats(): FileEntityStats | undefined;
    exists(): boolean;
    getKind(): FileEntityKind;
    isFile(): boolean;
    isDirectory(): boolean;
    
    readText(): string;
    
    // TODO: Should a non-existant directory return [], or propagate the error?
    getChildren(): FileObject[];
    getDescendants(): FileObject[];
    
    touchFile(): void;
    touchDirectory(): void;
    
    writeText(value: string): void;
}

type FileObject = ExpandType<(
    & PathObject 
    & SyncAndAsync<FileObjectMethods>
)>;

interface FileObjectConstructor {
    new(...segments: AnyPath[]): FileObject;
    cwd(): FileObject;
}

/////////////////
// File entity //
/////////////////

const FileObject
: FileObjectConstructor 
= class Self 
implements PathObject, FileObjectMethods {
    readonly path: AbsolutePath;
    
    constructor(...segments: AnyPath[]) {
        this.path = Path_resolve(...segments);
    }
    
    static cwd(): FileObject {
        return new Self(Path_CurrentDirectory);
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
    get extension(): FileExtension | "" {
        return Path_getExtension(this.path);
    }
    
    /** Parent entity to this entity. */
    get parent(): FileObject {
        return new Self(Path_getParent(this.path));
    }
    
    /** Whether this entity is the root (of the drive). */
    get isRoot(): boolean {
        return Path_isRoot(this.path);
    }
    
    
    
    /** Joins the path to this entity's path, and returns an entity pointing to the result. */
    join(...pathSegments: AnyPath[]): FileObject {
        return new Self(Path_join(this.path, ...pathSegments));
    }
    
    /** Returns the relative path to get from this entity to the target entity.
     * 
     * Interesting side note, this is like `flip (-)` in a way. Given paths 
     * `parent = /one/two` and `child = /one/two/three`, the following holds:  
     * > `parent.to(child) == child.from(parent) == "three"`
     */
    to(target: Self): RelativePath {
        return Path_relative(this.path, target.path);
    }
    
    /** Changes the extension of this entity's path, and returns an entity pointing to the result. `newExtension` should include a '`.`'. */
    changeExtension(ext: FileExtension): FileObject {
        return new Self(Path_changeExtension(this.path, ext));
    }
    
    addSuffix(extension: FileExtension): FileObject {
        return new Self(Path_addSuffixExtension(this.path, extension));
    }
    
    
    /** Returns detailed statistics about this entity. */
    getStats(): FileEntityStats | undefined {
        try {
            return GetFileSystem().getStats(this);
        } catch (e) {
            return undefined;
        }
    }
    
    /** Returns whether or not this entity exists. */
    exists(): boolean {
        return this.getStats() !== undefined;
    }
    
    /**Returns the type if this entity exists, `undefined` otherwise. */
    getKind(): FileEntityKind | undefined {
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
        return GetFileSystem().readFile(this.path);
    }
    
    /** Writes a UTF-8 encoded string to this file. */
    writeText(s: string): void {
        GetFileSystem().writeFile(this.path, s);
    }
    
    ////////////////////
    // Touching 👉👈 //
    ////////////////////
    
    touchFile(): void {
        GetFileSystem().createFile(this.path);
    }
    
    touchDirectory(): void {
        GetFileSystem().createDirectory(this.path);
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
    
    private readDirectory(recursive: boolean | undefined): Self[] {
        return (
            from(GetFileSystem().readDirectory({
                path: this.path, 
                recursive,
            }))
            .selectWhere(entity => 
                entity.kind === "file" && 
                new Self(this.path, entity.location)
            )
            .toArray()
        );
    }
    
    /** Reads this directory, and returns an entity list of its contents. */
    getChildren(): Self[] {
        try {
            for (const filename of readdirSync(this.path)) {
                yield this.join(filename);
            }
        } catch (e) {
            return;
        }
    }
    
    /** Iterates recursively through all files in this directory and its subdirectories. */
    getDescendants(): Self[] {
        return (
            from(GetFileSystem().readDirectory({
                path: this.path, 
                recursive: true
            }))
            .selectWhere(entity => 
                entity.kind === "file" && 
                new Self(this.path, entity.location)
            )
            .toArray()
        );
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

/** Models a file in the file system. */
export const File = FileObject;
export type  File = FileObject;

/** Models a directory in the file system. */
export const Directory = FileObject;
export type  Directory = FileObject;

/** Models a file or a directory in the file system. */
export const FileOrDirectory = FileObject;
export type  FileOrDirectory = FileObject;
