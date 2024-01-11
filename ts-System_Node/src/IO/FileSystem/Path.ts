// Wraps nodejs's path module, to maintain information about the kind of path.

import * as path from "node:path";

import { Newtype, UnknownString, satisfiesStrictly, swear } from "@wkronemeijer/system";

import { resolve, join, relative, parse, isAbsolute, sep, normalize, extname } from "path";
import { pathToFileURL } from "url";

import { FileExtension, OptionalFileExtension } from "./Extension";

/** Underlying path representation (a string). */
export type RawPath = UnknownString;

/** 
 * An absolute path. 
 * 
 * Paths to the same object regardless of the current working directory. 
 */
export type AbsolutePath = Newtype<RawPath, "AbsolutePath">;
/** 
 * A relative path. 
 * 
 * If no absolute path is eventually specified, 
 * it defaults to being relative to the current working directory. 
 */
export type RelativePath = Newtype<RawPath, "RelativePath">;

// Not happy with these names, but I know precisely what they mean. 

/** Either an absolute or a relative path. */
export type Path    = AbsolutePath | RelativePath;

// TODO: Include a type for file URLs
export type AnyPath = Path | RawPath;

/** Returns whether a path is absolute. */
export function Path_isAbsolute(path: AnyPath): path is AbsolutePath {
    return isAbsolute(path);
}

/** Returns whether a path is relative. */
export function Path_isRelative(path: AnyPath): path is RelativePath {
    return !Path_isAbsolute(path);
}

export const AbsolutePath = satisfiesStrictly(Path_isAbsolute);
export const RelativePath = satisfiesStrictly(Path_isRelative);

export function Path(anyPath: AnyPath): Path {
    return normalize(anyPath) as Path;
}

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

export const Path_Separator = sep as '/' | '\\';
/** @deprecated Spelling */
export const Path_Seperator = Path_Separator;

export function Path_declare(path: AnyPath): Path {
    return path as Path;
}

/** Turns any path into an absolute one. */
export function Path_resolve(...pathSegments: AnyPath[]): AbsolutePath {
    return resolve(...pathSegments) as AbsolutePath;
}

/** Joins paths on a base path. */
export function Path_join(base: AbsolutePath, ...paths: AnyPath[]): AbsolutePath;
/** Joins paths to form a new relative path. */
export function Path_join(base: RelativePath, ...paths: RelativePath[]): RelativePath;
/** Joins paths to form a new relative path. */
export function Path_join(...paths: AnyPath[]): Path;
/** Implementation. */
export function Path_join(...paths: AnyPath[]): Path {
    return join(...paths) as Path;
}

/** Solves the relative path to get from argument 1 to argument 2. */
export function Path_relative(from: AbsolutePath, to: AbsolutePath): RelativePath {
    return relative(from, to) as RelativePath;
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
    const { root, dir, base, ext, name } = parse(self);
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

export function Path_isRoot(path: AbsolutePath): boolean {
    // So this is stupid, but it works well
    return Path_join(path, Path_ParentDirectory) === path
}

////////////////////////
// Domain: Extensions //
////////////////////////

export function Path_getExtension(self: Path): FileExtension | "" {
    const extension = extname(self);
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
    return pathToFileURL(self).toString();
}

const backwardSlash = '\\';
const forwardSlash = '/';

export function RelativePath_toUrl(self: RelativePath): string {
    return encodeURI(self.replaceAll(backwardSlash, forwardSlash));
}

export function Path_toUrl(self: Path): string {
    if (Path_isAbsolute(self)) {
        return AbsolutePath_toUrl(self);
    } else {
        return RelativePath_toUrl(self);
    }
}

/** Makes a relative path look more relative. */
export function RelativePath_toString(self: RelativePath): RelativePath {
    return `${Path_CurrentDirectory}${Path_Separator}${self}` as RelativePath;
}
