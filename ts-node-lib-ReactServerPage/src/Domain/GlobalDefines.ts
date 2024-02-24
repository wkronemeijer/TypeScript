import { AbsolutePath } from "@wkronemeijer/system-node";

export interface RaspRequestInfo {
    readonly url: string;
    /** Similar to `__filename`. */
    readonly file: AbsolutePath;
}

// Always sync these two
declare          global            {    const __REQUEST_INFO: RaspRequestInfo; }
export interface RaspGlobalDefines { readonly __REQUEST_INFO: RaspRequestInfo; }
