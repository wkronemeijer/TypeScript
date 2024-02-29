import { Array_lastElement, RegExpNewtype, swear } from "@wkronemeijer/system";
import { MediumUrl, MediumUrl_getFileName } from "./Url";

export type  MediumFileExtension = ReturnType<typeof MediumFileExtension>;
export const MediumFileExtension = RegExpNewtype("MediumFileExtension",
    /^\.\w+$/
);

export function MediumUrl_getExtension(
    self: MediumUrl,
    base?: string,
): MediumFileExtension | undefined {
    try {
        const filename = MediumUrl_getFileName(self, base);
        swear(filename);
            // FIXME: Filenames like '.foo' and '.foo.mp3' trip this function up
        swear(!filename.startsWith('.'));
        const extension = Array_lastElement(filename.split('.'));
        swear(extension);
        return MediumFileExtension(`.${extension}`);
    } catch {
        return undefined;
    }
}
