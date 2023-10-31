import { Member, StringEnum } from "@wkronemeijer/system";
import { File } from "@wkronemeijer/system-node";

export type  MediumKind = Member<typeof MediumKind>;
export const MediumKind = StringEnum([
    "img",
    "video",
] as const);

const hidden = /____/;
const regeces = new Map<MediumKind, RegExp>([
    ["img"  , /\.(png|jpe?g|jfif|gif|webp)/],
    ["video", /\.(mp4|webm)/               ],
]);

export function MediumKind_fromFile(file: File): MediumKind | undefined {
    const ext = file.extension;
    
    if (hidden.test(ext)) {
        return undefined;
    } 
    
    for (const [kind, pattern] of regeces) {
        if (pattern.test(ext)) {
            return kind;
        }
    }
}
