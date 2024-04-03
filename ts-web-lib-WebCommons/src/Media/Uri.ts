import { Array_lastElement, Newtype, RegExpNewtype, identity } from "@wkronemeijer/system";

export type  Uri = ReturnType<typeof Uri>;
export const Uri = RegExpNewtype("Uri",
    /^\S+$/
    // Integrate https://stackoverflow.com/a/1547940 if you are ever bored
);

export type MediumUri = Newtype<Uri, "MediumUri">;
export type ImageUri  = Newtype<MediumUri, "ImageUri">;
export type AudioUri  = Newtype<MediumUri, "AudioUri">;
export type VideoUri  = Newtype<MediumUri, "VideoUri">;

// TODO: Create a proper URL parser
// Funny thing, that can go into common...
// And Extension can be all the way in common too
// Question of "" extension, remains.
/**
 * Returns the decoded "filename" of a URL.
 */
export function MediumUri_getFileName(
    self: MediumUri,
    base = window.location.href
): string | undefined {
    const encoded = Array_lastElement(
        new URL(self, base)
        .pathname
        .split('/')
        .filter(identity)
    );
    if (encoded) {
        return decodeURIComponent(encoded);
    }
}

const HiddenPattern = /^(____|\.)/;

export function MediumUri_isHidden(
    self: MediumUri, 
    base?: string,
): boolean {
    const filename = MediumUri_getFileName(self, base);
    if (filename) {
        if (HiddenPattern.test(filename)) {
            return true;
        }
    }
    return false;
}
