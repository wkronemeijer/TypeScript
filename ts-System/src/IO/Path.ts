// Wraps nodejs's path module, to maintain information about the kind of path.

import { resolve, join, relative, ParsedPath, parse, isAbsolute, sep, normalize } from "path";
import { pathToFileURL } from "url";

import { satisfiesStrictly } from "../Types/Satisfies";
import { requires } from "../Assert";
import { Newtype } from "../Types/Newtype";

/** Underlying path representation (a string). */
export type RawPath = string;

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

/** Parses a path and returns an object with details. **Note that the `ext` field includes a leading `.`**. */
export function Path_getDetails(self: AnyPath): ParsedPath {
    // Not replaced with readonly, because that scrubs the doc comments.
    return parse(self);
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

function assert_isExtension(ext: string): void {
    requires(ext.startsWith('.'), `Extension must start with leading '.'.`);
}

export function Path_setExtension<P extends Path>(self: P, newExtension: string): P {
    assert_isExtension(newExtension);
    const { dir, name } = Path_getDetails(self);
    return Path_join(dir, name + newExtension) as P;
}

/** Modifies the file extension. If no extension is present, does not add one either. */
export function Path_changeExtension<P extends Path>(self: P, newExtension: string): P {
    assert_isExtension(newExtension);
    const { dir, name, ext } = Path_getDetails(self);
    if (ext.length > 0) {
        return Path_join(dir, name + newExtension) as P;
    } else {
        return self;
    }
}

export function Path_removeExtension<P extends Path>(self: P): P {
    const { dir, name, ext } = Path_getDetails(self);
    if (ext.length > 0) {
        return Path_join(dir, name) as P;
    } else {
        return self;
    }
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

export function RelativePath_toUrl(self: RelativePath): string {
    const base     = AbsolutePath_toUrl(Path_resolve("."));
    const resolved = AbsolutePath_toUrl(Path_resolve(self));
    
    return resolved.slice(base.length + 1); // +1 for the directory separator
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
