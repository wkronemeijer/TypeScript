import { Newtype, Newtype_createRegExpChecker } from "@wkronemeijer/system";

/** File extension. 
 * 
 * Defined by the non-empty returns of `extname`. */
export type  FileExtension = Newtype<string, "FileExtension">;
export const FileExtension = Newtype_createRegExpChecker<FileExtension>(
    /^\.\S*$/ // Excluding ""
    // /^(|\.\S*)$/ // Including ""
);
// NB: extname("foo.") == "."

export type     OptionalFileExtension = FileExtension | ""
export function OptionalFileExtension(string: string): OptionalFileExtension {
    return (string === "") ? string : FileExtension(string);
}
