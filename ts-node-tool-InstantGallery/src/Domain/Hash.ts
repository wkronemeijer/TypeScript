import { createHash } from "crypto";

import { RegExpNewtype } from "@wkronemeijer/system";
import { File } from "@wkronemeijer/system-node";

export type  Hash = ReturnType<typeof Hash>;
export const Hash = RegExpNewtype("Hash", /[0-9A-Fa-f]+/);

export function Hash_fromFileName(file: File): Hash {
    return Hash(
        createHash("md5")
        .update(file.path)
        .digest("hex")
    );
}
