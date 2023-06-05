import { AbsolutePath, Newtype, AbsolutePath_toUrl as tempToUrl } from "@wkronemeijer/system";

export type AbsoluteFileUrl = Newtype<string, "AbsoluteUrlPath">;
export type RelativeFileUrl = Newtype<string, "RelativeUrlPath">;
export type UrlPath = 
    | AbsoluteFileUrl 
    | RelativeFileUrl
;

// TODO: Work this out like RelativePath

export function AbsolutePath_toUrl(self: AbsolutePath): AbsoluteFileUrl {
    return tempToUrl(self) as AbsoluteFileUrl;
}
