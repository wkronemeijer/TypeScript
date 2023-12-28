import { Newtype, Newtype_createRegExpChecker } from "@wkronemeijer/system";

/** File extension. 
 * 
 * Defined by the non-empty returns of `extname`. */
export type  FileExtension = Newtype<string, "FileExtension">;
export const FileExtension = Newtype_createRegExpChecker<FileExtension>(
    /^\.\S*$/
    // extname("foo.") == "."
);
