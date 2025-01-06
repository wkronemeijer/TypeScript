import {RegExpNewtype} from "@wkronemeijer/system";

/** File extension. 
 * 
 * Defined by the non-empty returns of `extname`. */
export type  FileExtension = ReturnType<typeof FileExtension>;
export const FileExtension = RegExpNewtype("FileExtension",
    /^\.\S*$/ // Excluding ""
    // /^(|\.\S*)$/ // Including ""
);
// NB: extname("foo.") == "."
// At the same time, "foo." isn't a valid filename on windows

export type     OptionalFileExtension = FileExtension | ""
export function OptionalFileExtension(string: string): OptionalFileExtension {
    return (string === "") ? string : FileExtension(string);
}
