import { FileObject } from "@wkronemeijer/system-node";
import { Dictionary } from "@wkronemeijer/system";

const file = new FileObject(__REQUEST_INFO.file);
const searchObject = Dictionary.from(new URL(__REQUEST_INFO.url).searchParams);

// ...this name is unlikely to conflict.
export const pageself = {
    file,
    searchObject,
} as const;

/** @deprecated Use {@link pageself.searchObject} directly. */
export function getQueryParams(): Dictionary<string> {
    return pageself.searchObject;
}
