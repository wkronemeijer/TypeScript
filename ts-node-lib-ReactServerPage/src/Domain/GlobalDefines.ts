export interface RaspRequestInfo {
    readonly url: string;
}

// Always sync these two
declare          global            {    const __REQUEST_INFO: RaspRequestInfo; }
export interface RaspGlobalDefines { readonly __REQUEST_INFO: RaspRequestInfo; }
