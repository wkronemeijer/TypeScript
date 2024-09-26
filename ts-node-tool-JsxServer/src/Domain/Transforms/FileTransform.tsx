import {DirectoryObject, FileObject} from "@wkronemeijer/system-node";
import {TypedResponseBody} from "../TypedResponseBody";

export interface FileTransformRequest {
    /** `file:` URL which is the root of what is being served. */
    readonly rootUrl: URL;
    /** Directory object being used as the root. */
    readonly root: DirectoryObject;
    
    /** Virtual `file:` URL currently being served. */
    readonly url: URL;
    /** Virtual file object currently being served. */
    readonly file: FileObject;
}

export interface FileTransform<TR extends TypedResponseBody = TypedResponseBody> {
    /** Successful matches of the path component of the request url trigger this tranform. */
    readonly pattern: string | RegExp;
    
    /** Whether the request file is **not** required to exist. */
    readonly virtual?: boolean;
    
    render_async(request: FileTransformRequest): Promise<TR>;
    renderError_async(error: Error, originalRequest: FileTransformRequest): Promise<TR>;
}
