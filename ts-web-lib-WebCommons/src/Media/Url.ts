import { Array_lastElement, RegExpNewtype, identity } from "@wkronemeijer/system";

export type  MediumUrl = ReturnType<typeof MediumUrl>;
export const MediumUrl = RegExpNewtype("MediumUrl",
    /^\S+$/
    // Integrate https://stackoverflow.com/a/1547940 if you are ever bored
);

/**
 * Returns a URL-encoded "filename" of a URL.
 */
export function MediumUrl_getFileName(
    self: MediumUrl,
    base = window.location.href
): string | undefined {
    return Array_lastElement(
        new URL(self, base)
        .pathname
        .split('/')
        .filter(identity)
    );
}

const HiddenPattern = /^(____|\.)/;

export function MediumUrl_isHidden(
    self: MediumUrl, 
    base?: string,
): boolean {
    const filename = MediumUrl_getFileName(self, base);
    if (filename) {
        if (HiddenPattern.test(filename)) {
            return true;
        }
    }
    return false;
}
