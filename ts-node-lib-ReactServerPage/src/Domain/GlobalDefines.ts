import { RaspRequestId } from "@wkronemeijer/react-server-page-provider";

export interface RaspRequestInfo {
    readonly id: RaspRequestId;
    readonly url: string;
}

// Always sync these two
declare          global            {    const __REQUEST_INFO: RaspRequestInfo; }
export interface RaspGlobalDefines { readonly __REQUEST_INFO: RaspRequestInfo; }
