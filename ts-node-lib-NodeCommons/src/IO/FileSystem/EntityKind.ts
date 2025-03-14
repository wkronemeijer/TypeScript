import {StringEnum} from "@wkronemeijer/system";

/** Partial enumeration of the kinds of file entities. */
export type  FileEntityKind = ReturnType<typeof FileEntityKind>;
export const FileEntityKind = StringEnum([
    "file",
    "directory",
    "symlink",
    "other",
]);
