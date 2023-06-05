import { Member, StringEnum_create } from "@wkronemeijer/system";

export type  FileKind = Member<typeof FileKind>;
export const FileKind = StringEnum_create([
    "other",
    "file",
    "directory",
] as const);
