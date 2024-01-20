// Medium...now that takes me back.

import { Directory, File, RelativePath_toUrl } from "@wkronemeijer/system-node";
import { from } from "@wkronemeijer/system";

import { MediumKind, MediumKind_fromFile } from "./MediumKind";
import { Hash, Hash_fromFileName } from "./Hash";

export interface Medium {
    readonly hash: Hash;
    readonly file: File;
    readonly kind: MediumKind;
    readonly thumbUrl: string;
    readonly relativeUrl: string;
}

export const Thumb_urlPattern = `/thumbs`;

function inferThumbUrl(hash: Hash): string {
    return `${Thumb_urlPattern}/${hash}`
    // TODO: How do you connect the logic here with the router?
}

export function Medium(root: Directory, file: File): Medium | undefined {
    const kind = MediumKind_fromFile(file); 
    if (kind !== undefined) {
        const hash        = Hash_fromFileName(file);
        const thumbUrl    = inferThumbUrl(hash);
        const relativeUrl = RelativePath_toUrl(root.to(file));
        
        return { 
            hash, 
            file, 
            kind, 
            thumbUrl, 
            relativeUrl,
        };
    }
}

export function Medium_discoverFiles(root: Directory): Medium[] {
    return (
        from(root.recursiveGetAllFiles())
        .selectWhere(file => Medium(root, file))
        .toArray()
    );
}
