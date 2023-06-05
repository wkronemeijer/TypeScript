import { File, Member, StringEnum_create } from "@wkronemeijer/system";

export type  MediumKind = Member<typeof MediumKind>;
export const MediumKind = StringEnum_create([
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
