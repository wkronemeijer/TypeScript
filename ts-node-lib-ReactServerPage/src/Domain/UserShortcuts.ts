import {Dictionary, giveDeprecationWarning, JsonValue, parseJson} from "@wkronemeijer/system";
import {FileObject} from "@wkronemeijer/system-node";

interface Pageself {    
    /** 
     * The location of this file. 
     * 
     * Useful for resolving relative resources. 
     */
    readonly file: FileObject;
    
    /**
     * A pre-parsed `URLSearchParameters` of the request URL.
     */
    readonly searchObject: Dictionary<string>;
    
    /**
     * The raw string text sent as a request body. 
     * 
     * `undefined` if there was no text body.
     */
    readonly bodyText: string;
    
    /**
     * The body text parsed as JSON, if it is valid JSON.
     */
    readonly bodyJson: JsonValue;
}

const file         = new FileObject(__REQUEST_INFO.file);
const searchObject = Dictionary.from(new URL(__REQUEST_INFO.url).searchParams);
const bodyText     = __REQUEST_INFO.body ?? "";

let bodyJson: JsonValue;
try {
    bodyJson = parseJson(bodyText);
} catch {
    bodyJson = null;
}

// ...this name is unlikely to conflict.
export const pageself: Pageself = {file, searchObject, bodyText, bodyJson};

/** @deprecated Use {@link pageself.searchObject} directly. */
export const getQueryParams = (): Dictionary<string> => {
    giveDeprecationWarning(getQueryParams);
    return pageself.searchObject;
}
