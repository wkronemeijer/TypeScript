import { Immutable, Printable } from "@wkronemeijer/system";

import { pathToFileURL } from "url";

import { AbsolutePath, AnyPath, PathDetails, Path_addSuffixExtension, Path_changeExtension, Path_getDetails, Path_getParent, Path_isRoot, Path_join, Path_relative, Path_resolve, RelativePath } from "./Path";
import { FileExtension, OptionalFileExtension } from "./Extension";
import { HasAbsolutePath } from "./HasAbsolutePath";

export interface PathObject 
extends HasAbsolutePath, Printable {
    readonly url: URL;
    
    readonly directory: AbsolutePath;
    readonly root: AbsolutePath;
    readonly fullName: RelativePath;
    readonly name: string;
    readonly extension: OptionalFileExtension;
    
    readonly parent: this;
    readonly isRoot: boolean;
    
    join(...segments: readonly AnyPath[]): this;
    to(other: HasAbsolutePath): RelativePath;
    
    addSuffix(extension: FileExtension): this;
    addExtension(extension: FileExtension): this;
    changeExtension(extension: OptionalFileExtension): this;
    removeExtension(): this;
}

interface PathObjectConstructor {
    new(...segments: AnyPath[]): PathObject;
}

export const PathObject
:            PathObjectConstructor 
= class      PathObjectImpl 
extends      Immutable 
implements   PathObject {
    readonly path: AbsolutePath;
    
    constructor(...segments: AnyPath[]) {
        super();
        this.path = Path_resolve(...segments);
    }
    
    get parent(): this {
        return this.with({ path: Path_getParent(this.path) });
    }
    
    join(...segments: readonly AnyPath[]): this {
        return this.with({ path: Path_join(this.path, ...segments) });
    }
    
    to(other: HasAbsolutePath): RelativePath {
        return Path_relative(this.path, other.path);
    }
    
    /////////////////////
    // Path components //
    /////////////////////
    
    get url(): URL {
        return pathToFileURL(this.path);
    }
    
    private get details(): PathDetails<AbsolutePath> {
        return Path_getDetails(this.path);
    }
    
    get directory(): AbsolutePath {
        return this.details.directory;
    }
    
    get root(): AbsolutePath {
        return this.details.root;
    }
    
    get isRoot(): boolean {
        return Path_isRoot(this.path);
    }
    
    get name(): string {
        return this.details.name;
    }
    
    get extension(): OptionalFileExtension {
        return this.details.extension;
    }
    
    get fullName(): RelativePath {
        return this.details.base;
    }
    
    ////////////////
    // Extensions //
    ////////////////
    
    addSuffix(suffix: FileExtension): this {
        return this.with({ path: Path_addSuffixExtension(this.path, suffix) });
    }
    
    changeExtension(ext: OptionalFileExtension): this {
        return this.with({ path: Path_changeExtension(this.path, ext) });
    }
    
    addExtension(ext: FileExtension): this {
        return this.changeExtension(ext);
    }
    
    removeExtension(): this {
        return this.changeExtension("");
    }
    
    //////////////////////////
    // implements Printable //
    //////////////////////////
    
    toString(): string {
        return `PathObject(${this.path})`;
    }
}
