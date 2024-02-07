import { File, Directory } from "@wkronemeijer/system-node";
import { RaspRequestId } from "@wkronemeijer/react-server-page-provider";
import { ReadonlyURL } from "@wkronemeijer/system";

import { MimeTypedString } from "../MimeType";

export interface FileTransformRequest {
    readonly id: RaspRequestId;
    
    /** `file:` URL which is the root of what is being served. */
    readonly rootUrl: ReadonlyURL;
    /** Directory object being used as the root. */
    readonly rootDirectory: Directory;
    
    /** Virtual `file:` URL currently being served. */
    readonly url: ReadonlyURL;
    /** Virtual file object currently being served. */
    readonly file: File;
}

export interface FileTransform<S extends MimeTypedString> {
    /** Successful matches of the path component of the request url trigger this tranform. */
    readonly pattern: RegExp;
    
    /** Whether the request file is **not** required to exist. */
    readonly virtual?: boolean;
    
    render_async(request: FileTransformRequest): Promise<S>;
    renderError_async(error: Error, originalRequest: FileTransformRequest): Promise<S>;
}
