import { AbsolutePath } from "@wkronemeijer/system-node";

export interface RaspRequestInfo {
    readonly url: string;
    readonly file: AbsolutePath;
    readonly body: string | undefined;
}

// Always sync these two
declare          global            {    const __REQUEST_INFO: RaspRequestInfo; }
export interface RaspGlobalDefines { readonly __REQUEST_INFO: RaspRequestInfo; }
// Is there some way to do `interface GlobalThis extends RaspGlobalDefines {}`?
// You can with Window but what about the other sources?
