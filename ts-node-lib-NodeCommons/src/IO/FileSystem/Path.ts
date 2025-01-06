// Wraps nodejs's path module, to maintain information about the kind of path.
import {FileExtension, OptionalFileExtension} from "./Extension";
import {Newtype, satisfiesStrictly, swear} from "@wkronemeijer/system";

import {
    // TODO: Namespace imports are slower in Lua, not sure about JS however.
    resolve    as node_resolve, 
    join       as node_join, 
    relative   as node_relative, 
    parse      as node_parse, 
    isAbsolute as node_isAbsolute, 
    sep        as node_sep,
    extname    as node_extname,
} from "path";
import {
    pathToFileURL as node_pathToFileURL,
} from "url";

/** Underlying path representation (a string). */
export type RawPath = string & {};

/** Either an absolute or a relative path. */
export type Path = Newtype<RawPath, "Path">;

/** 
 * An absolute path. 
 * 
 * Paths to the same object regardless of the current working directory. 
 */
export type AbsolutePath = Newtype<Path, "AbsolutePath">;

/** Returns whether a path is absolute. */
export function Path_isAbsolute(path: AnyPath): path is AbsolutePath {
    return node_isAbsolute(path);
}

export const AbsolutePath = satisfiesStrictly(Path_isAbsolute);

/** 
 * A relative path. 
 * 
 * If no absolute path is eventually specified, 
 * it defaults to being relative to the current working directory. 
 */
export type RelativePath = Newtype<Path, "RelativePath">;

/** Returns whether a path is relative. */
export function Path_isRelative(path: AnyPath): path is RelativePath {
    return !Path_isAbsolute(path);
}

export const RelativePath = satisfiesStrictly(Path_isRelative);

export function Path(...paths: AnyPath[]): Path {
    return node_join(...paths) as Path;
}

// TODO: Include a type for file URLs
export type AnyPath = Path | RawPath;

///////////////////////
// Pre-defined paths //
///////////////////////

/** Relative path to the current directory. */
export const Path_CurrentDirectory = "." as RelativePath;
/** Relative path to the parent directory. */
export const Path_ParentDirectory = ".." as RelativePath;

export const Path_AppData = (function(){
    const windowsAppdata = process.env["LOCALAPPDATA"];
    swear(windowsAppdata) // sorry *nix users, submit a PR :)
    return AbsolutePath(windowsAppdata);
}());

///////////////////
// Path calculus //
///////////////////

export const Path_Separator = node_sep as '/' | '\\';

export function Path_declare_unsafe(path: AnyPath): Path {
    return path as Path;
}

/** Turns any path into an absolute one. */
export function Path_resolve(...pathSegments: AnyPath[]): AbsolutePath {
    return node_resolve(...pathSegments) as AbsolutePath;
}

/** Joins paths on a base path. */
export function Path_join(base: AbsolutePath, ...paths: AnyPath[]): AbsolutePath;
/** Joins paths to form a new relative path. */
export function Path_join(base: RelativePath, ...paths: RelativePath[]): RelativePath;
/** Joins paths to form a new relative path. */
export function Path_join(...paths: AnyPath[]): Path;
/** Implementation. */
export function Path_join(...paths: AnyPath[]): Path {
    return node_join(...paths) as Path;
}

/** Solves the relative path to get from argument 1 to argument 2. */
export function Path_relative(from: AbsolutePath, to: AbsolutePath): RelativePath {
    // FIXME: relative can return an absolute path on windows if it is cross-drive
    return node_relative(from, to) as RelativePath;
}

////////////////
// Inspection //
////////////////

export interface PathDetails<P extends Path> {
    readonly root: P;
    readonly directory: P;
    /** Base name, including the extension. */
    readonly base: RelativePath;
    /** The extension, like ".txt" or "". */
    readonly extension: OptionalFileExtension;
    /** The name of the file, without extension. */
    readonly name: string;
}

/** Parses a path and returns an object with details. */
export function Path_getDetails<P extends Path>(self: P): PathDetails<P> {
    const { root, dir, base, ext, name } = node_parse(self);
    return {
        root: root as P,
        directory: dir as P,
        base: base as RelativePath,
        extension: OptionalFileExtension(ext),
        name,
    };
}

export function Path_getParent<P extends Path>(self: P): P {
    return Path_join(self, Path_ParentDirectory) as P;
}

// https://stackoverflow.com/questions/37521893/determine-if-a-path-is-subdirectory-of-another-in-node-js/45242825#45242825
export function Path_hasDescendant(self: AbsolutePath, possibleChild: AbsolutePath): boolean {
    const delta = Path_relative(self, possibleChild);
    return (
        delta.length > 0                        && // not itself
        !delta.startsWith(Path_ParentDirectory) && 
        Path_isRelative(delta)
    );
}

/** Returns true if self is equal to, or an ancestor of the given path. */
export function Path_super(self: AbsolutePath, candidate: AbsolutePath): boolean {
    const relativePath = node_relative(self, candidate);
    if (node_isAbsolute(relativePath)) {
        // relative('C:/foo', 'D:/bar') produces an absolute path
        return false;
    }
    const segments = relativePath.split(node_sep);
    // if segments is empty, then the paths are the same
    return !segments.includes(Path_ParentDirectory);
}

/** 
 * Checks if the given path is at the root. 
 * Note that on Windows, both `C:\` and `D:\` are root paths.
 */
export function Path_isRoot(path: AbsolutePath): boolean {
    // So this is stupid, but it works well
    return Path_join(path, Path_ParentDirectory) === path
}

/** Checks if two paths resolve to the same value. */
export function Path_equals(lhs: Path, rhs: Path): boolean {
    return node_resolve(lhs) === node_resolve(rhs);
}

////////////////////////
// Domain: Extensions //
////////////////////////

export function Path_getExtension(self: Path): FileExtension | "" {
    const extension = node_extname(self);
    if (extension !== "") {
        return FileExtension(extension);
    } else {
        // Sadly, TS doesn't narrow string to "" in false branches
        return extension;
    }
}

/** Modifies the file extension. If no extension is present, does not add one either. */
export function Path_changeExtension<P extends Path>(self: P, newExtension: OptionalFileExtension): P {
    const { directory, name, extension } = Path_getDetails(self);
    if (extension.length > 0) {
        return Path_join(directory, name + newExtension) as P;
    } else {
        return self;
    }
}

export function Path_addSuffixExtension<P extends Path>(self: P, suffix: FileExtension): P {
    const { directory, name, extension } = Path_getDetails(self);
    return Path_join(directory, name + suffix + extension) as P;
}

/////////////////////////
// From string to path //
/////////////////////////
// Copied from https://github.com/django/django/blob/main/django/utils/text.py#L400
// Bit more aggressive than strictly necessary, but will work well enough. 

/** 
 * For assigning filenames to user-named objects.  
 * 
 * @deprecated Why is this called sanitize? 
 */
export function Path_urlSanitize(raw: string): RelativePath {
    return (
        raw
        .toLowerCase()
        .replace(/[^\w\s\-]/g, "")
        .replace(/[\s\-]/g, "-")
    ) as RelativePath;
}

/** 
 * For assigning filenames to user-named objects.  
 * 
 * @deprecated Why is this called sanitize? 
 */
export function Path_cssSanitize(raw: string): RelativePath {
    return (
        raw
        .replace(/[^\w\s\-]/g, "")
        .replace(/[\s\-]/g, "-")
    ) as RelativePath;
}

//////////////////////////////////////////////////////////////////////
// File and directory IO stuff because FSE's actually kinda suck... //
//////////////////////////////////////////////////////////////////////

// TODO: Maybe split up along file and directory modules? and then File_xxx functions for file specific stuff
// Bonus points if the wrong type just generates mzero values

///////////////
// Url stuff //
///////////////

export function AbsolutePath_toUrl(self: AbsolutePath): string {
    return node_pathToFileURL(self).toString();
}

export function RelativePath_toUrl(self: RelativePath): string {
    return encodeURI(self.replaceAll(node_sep, '/'));
}

export function Path_toUrl(self: Path): string {
    if (node_isAbsolute(self)) {
        return AbsolutePath_toUrl(self as AbsolutePath);
    } else {
        // TS can't infer that ¬Absolute --> Relative
        // TODO: Could you do that?
        return RelativePath_toUrl(self as RelativePath);
    }
}

/** Makes a relative path look more relative. */
export function RelativePath_toString(self: RelativePath): RelativePath {
    return `${Path_CurrentDirectory}${Path_Separator}${self}` as RelativePath;
}
