import { createHash } from "crypto";

import { AbsolutePath, File, Function_memoize, Newtype, requires } from "@wkronemeijer/system";

const hexHashPattern = /[0-9A-Fa-f]+/;

export type     Hash = Newtype<string, "Hash">;
export function Hash(string: string): Hash {
    requires(hexHashPattern.test(string), 
        () => `'${string}' should be a valid hash.`);
    return string as Hash;
}


const hashByFileName = new Map<AbsolutePath, Hash>;

export function Hash_fromFileName(file: File): Hash {
    return Hash(
        createHash("md5")
        .update(file.path)
        .digest("hex")
    );
}
