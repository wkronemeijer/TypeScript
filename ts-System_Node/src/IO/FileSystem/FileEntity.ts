import { ParsedPath, parse } from "path";
import { Stats, lstatSync, readFileSync, writeFileSync } from "fs";
import { lstat, readFile, writeFile } from "fs/promises";

import { AbsolutePath, AnyPath, ComparableObject, EquatableObject, Ordering, Path_changeExtension, Path_getParent, Path_hasDescendant, Path_isRoot, Path_join, Path_relative, Path_resolve, RelativePath, Sequence, compare, notImplemented, terminal } from "@wkronemeijer/system";

import { FileExtension, FileExtension_hasInstance, FileExtension_join } from "./FileExtension";
import { AbsoluteFileUrl, AbsolutePath_toUrl } from "./FileUrl";
import { FileKind } from "./FileKind";

type Synchronicity = 
    | "sync"
    | "async"
;

type MaybePromise<Async extends Synchronicity, T> = 
    Async extends "sync"  ? T          :
    Async extends "async" ? Promise<T> :
    never
;

interface FileLike {
    readonly path: AbsolutePath;
}

interface File 
extends FileLike {
    toString(): AbsolutePath;
    readonly url: AbsoluteFileUrl;
    
    readonly name: string;
    
    readonly extension: FileExtension | undefined;
    getExtensions(): Sequence<FileExtension>;
    
    readonly baseName: string;
    /** @deprecated replace with {@link baseName}. */
    readonly fullName: string;
    
    readonly parent: File;
    readonly isRoot: boolean;
    
    addExtension(extension: FileExtension): File;
    changeExtension(newExtension: FileExtension): File;
    
    
    /** Joins the path to this entity's path, and returns an entity pointing to the result. */
    join(...pathSegments: AnyPath[]): File ;
    
    
    to(file: FileLike): RelativePath;
    hasChild(file: FileLike): boolean;
    hasDirectChild(file: FileLike): boolean;
    
    readonly sync: FileView<"sync">;
    readonly async: FileView<"async">;
}

const assert_matchesPropertyName:
    File extends { [P in Synchronicity]: FileView<P> }
? true : false = true;

/** 
 * This ensures sync and async have the **exact** same methods. 
 */
interface FileView<S extends Synchronicity> {
    getStats(): MaybePromise<S, Stats | undefined>;
    
    exists(): MaybePromise<S, boolean>;
    getKind(): MaybePromise<S, FileKind | undefined>;
    isFile(): MaybePromise<S, boolean>;
    isDirectory(): MaybePromise<S, boolean>;
    
    touchFile(): MaybePromise<S, void>;
    touchDirectory(): MaybePromise<S, void>;
    
    readText(): MaybePromise<S, string>;
    writeText(s: string): MaybePromise<S, void>;
    
    readContents(): MaybePromise<S, Sequence<File>>;
    recursiveGetAllFiles(): MaybePromise<S, Sequence<File>>;
}

interface FileViewConstructor<S extends Synchronicity> {
    new(file: FileLike): FileView<S>;
}

interface FileConstructor {
    // Quick Ctrl+F determined I have never used the joining functionality of the constructor
    new(path: AnyPath | FileLike): File;
    cwd(): File;
}

/////////////////////
// Implementations //
/////////////////////

class FileViewImpl {
    protected readonly path: AbsolutePath;
    
    constructor(file: FileLike) {
        this.path = file.path;
    }
}

const encoding: BufferEncoding = "utf-8";

class SyncFileViewImpl 
extends FileViewImpl
implements FileView<"sync"> {
    getStats(): Stats | undefined {
        try {
            return lstatSync(this.path);
        } catch (_) {
            return undefined;
        }
    }
    
    exists(): boolean {
        return this.getStats() !== undefined;
    }
    
    getKind(): FileKind | undefined {
        const kind = this.getStats();
        if (kind) {
            if (kind.isFile()) {
                return "file";
            } else if (kind.isDirectory()) {
                return "directory";
            } else {
                return "other"
            }
        } else {
            return undefined;
        }
    }
    
    isFile(): boolean {
        return this.getKind() === "file";
    }
    
    isDirectory(): boolean {
        return this.getKind() === "directory";
    }
    
    touchFile(): void {
        notImplemented();
    }
    
    touchDirectory(): void {
        notImplemented();
    }
    
    readText(): string {
        return readFileSync(this.path, { encoding });
    }
    
    writeText(s: string): void {
        writeFileSync(this.path, s, { encoding });
    }
    
    readContents(): Sequence<File> {
        notImplemented();
    }
    
    recursiveGetAllFiles(): Sequence<File> {
        notImplemented();
    }
}

class AsyncFileViewImpl 
extends FileViewImpl
implements FileView<"async"> {
    async getStats(): Promise<Stats | undefined> {
        try {
            return await lstat(this.path);
        } catch (_) {
            return undefined;
        }
    }
    
    async exists(): Promise<boolean> {
        return (await this.getStats()) !== undefined;
    }
    
    async getKind(): Promise<FileKind | undefined> {
        const kind = await this.getStats();
        if (kind) {
            if (kind.isFile()) {
                return "file";
            } else if (kind.isDirectory()) {
                return "directory";
            } else {
                return "other"
            }
        } else {
            return undefined;
        }
    }
    
    async isFile(): Promise<boolean> {
        return (await this.getKind()) === "file";
    }
    
    async isDirectory(): Promise<boolean> {
        return (await this.getKind()) === "directory";
    }
    
    touchFile(): Promise<void> {
        notImplemented();
    }
    
    touchDirectory(): Promise<void> {
        notImplemented();
    }
    
    async readText(): Promise<string> {
        return await readFile(this.path, { encoding });
    }
    
    async writeText(s: string): Promise<void> {
        return await writeFile(this.path, s, { encoding });
    }
    
    async readContents(): Promise<Sequence<File>> {
        notImplemented();
    }
    
    async recursiveGetAllFiles(): Promise<Sequence<File>> {
        notImplemented();
    }
}

const      File
:          FileConstructor 
= class    FileImpl
implements File, EquatableObject, ComparableObject {
    readonly path: AbsolutePath;
    
    constructor(path: AnyPath | FileLike) {
        this.path = (typeof path === "string") ? 
            Path_resolve(path) : 
            path.path
        ;
    }
    
    static cwd(): File {
        return new File(".");
    }
    
    addExtension(extension: FileExtension): File {
        notImplemented();
    }
    
    changeExtension(newExtension: FileExtension): File {
        return new File(Path_changeExtension(this.path, newExtension));
    }
    
    join(...pathSegments: AnyPath[]): File {
        return new File(Path_join(this.path, ...pathSegments));
    }
    
    get sync(): FileView<"sync"> {
        return new SyncFileViewImpl(this);
    }
    
    get async(): FileView<"async"> {
        return new AsyncFileViewImpl(this);
    }
    
    toString(): AbsolutePath {
        return this.path;
    }
    
    get url(): AbsoluteFileUrl {
        return AbsolutePath_toUrl(this.path);
    }
    
    private getPathInfo(): ParsedPath {
        return parse(this.path);
    }
    
    get name(): string {
        return this.getPathInfo().name;
    }
    
    get extension(): FileExtension | undefined {
        const extension = this.getPathInfo().ext;
        return FileExtension_hasInstance(extension) ? extension : undefined;
    }
    
    getExtensions(): Sequence<FileExtension> {
        notImplemented();
        // Foo.generated.ts
        // would return:
        // [.ts, .generated]
    }
    
    get baseName(): string {
        return this.getPathInfo().base;
    }
    
    get fullName(): string {
        return this.baseName;
    }
    
    get parent(): File {
        return new File(Path_getParent(this.path));
    }
    
    get isRoot(): boolean {
        return Path_isRoot(this.path);
    }
    
    to(that: FileLike): RelativePath {
        return Path_relative(this.path, that.path);
    }
    
    hasChild(file: FileLike): boolean {
        return Path_hasDescendant(this.path, file.path);
    }
    
    hasDirectChild(file: FileLike): boolean {
        const targetParent = new File(file).parent;
        return this.path === targetParent.path
    }
    
    /////////////
    // Eq, Ord //
    /////////////
    
    equals(other: this): boolean {
        return this.path === other.path
    }
    
    compare(other: this): Ordering {
        return compare(this.path, other.path);
    }
}

/////////////
// Exports //
/////////////

export type  Directory = InstanceType<typeof File>;
export const Directory = File;

export type  Folder = InstanceType<typeof File>;
export const Folder = File;

/////////////
// Sandbox //
/////////////

const f = File.cwd();
f.join("src", "Modules").addExtension(FileExtension_join(".generated", ".ts")).sync.readText();

terminal.measureTime

/* 
Lets just use a a set of <xyz>Async methods 
Less pretty but also less of a typing clusterf*ck

Async as a suffix and not Sync because then 
    if (file.existsAsync())
looks wrong, which corresponds to it being wrong. 

Also, Sync should be the default
Also, measureTime_async exists

Now there is the question of doing 
the suffix is async
    async$measureTime
it should be a suffix
    measureTime_async
    measureTime_async
    measureTime$Async
    measureTime$async

function SomeType_measureThingAccurately_async(self): Promise<SomeType>;
function SomeType_measureThingAccuratelyAsync(self): Promise<SomeType>;
function SomeType_measureThingAccurately$async(self): Promise<SomeType>;

_async looks ugly
but it is a "variant" of a method

*/
