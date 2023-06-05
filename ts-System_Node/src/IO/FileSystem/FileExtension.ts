import { Newtype, satisfiesStrictly } from "@wkronemeijer/system";

function hasInstance(string: string): string is FileExtension {
    return string.startsWith('.');
}

export type  FileExtension = Newtype<string, "FileExtension">;
export const FileExtension = satisfiesStrictly(hasInstance);

export const FileExtension_hasInstance = hasInstance;

export function FileExtension_join(...extensions: string[]): FileExtension {
    return FileExtension(
        extensions
        .map(FileExtension)
        .join("")
    );
}
