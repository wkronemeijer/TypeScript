import { Array_lastElement, RegExpNewtype, swear } from "@wkronemeijer/system";
import { MediumUri, MediumUri_getFileName } from "./Uri";

export type  MediumFileExtension = ReturnType<typeof MediumFileExtension>;
export const MediumFileExtension = RegExpNewtype("MediumFileExtension",
    /^\.\w+$/
);

/** Tries to return the decoded substring of the URI that is the file extension. */
export function MediumUri_getExtension(
    self: MediumUri,
    base?: string,
): MediumFileExtension | undefined {
    try {
        const filename = MediumUri_getFileName(self, base);
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
