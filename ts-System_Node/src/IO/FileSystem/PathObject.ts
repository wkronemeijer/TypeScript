// Soooooo many items
// TODO: Reduce the number of exported items somehow
import { AbsolutePath, AnyPath, PathDetails, Path_addSuffixExtension, Path_changeExtension, Path_super, Path_getDetails, Path_getParent, Path_isRoot, Path_join, Path_relative, Path_resolve, RelativePath, RelativePath_toUrl } from "./Path";
import { FileExtension, OptionalFileExtension } from "./Extension";
import { Immutable, Printable } from "@wkronemeijer/system";
import { HasAbsolutePath } from "./HasAbsolutePath";
import { pathToFileURL } from "url";

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
    
    /** Returns a relative path from this object to the given path-like object.  */
    to(other: HasAbsolutePath): RelativePath;
    /** Returns a relative url from this object to the given path-like object. */
    urlTo(other: HasAbsolutePath): string;
    
    /** Returns true if this is the same as, or a descendant of the given path-like object. */
    extends(other: HasAbsolutePath): boolean;
    
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
    
    urlTo(other: HasAbsolutePath): string {
        return RelativePath_toUrl(this.to(other));
    }
    
    extends(other: HasAbsolutePath): boolean {
        return Path_super(other.path, this.path);
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
        return this.url.href;
    }
}
