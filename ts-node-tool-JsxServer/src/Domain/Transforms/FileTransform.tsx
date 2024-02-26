import { DirectoryObject, FileObject } from "@wkronemeijer/system-node";
import { MimeTypedString } from "../MimeType";
import { ReadonlyURL } from "@wkronemeijer/system";

type PathDescription = string | RegExp;

export interface FileTransformRequest {
    /** `file:` URL which is the root of what is being served. */
    readonly rootUrl: ReadonlyURL;
    /** Directory object being used as the root. */
    readonly root: DirectoryObject;
    
    /** Virtual `file:` URL currently being served. */
    readonly url: ReadonlyURL;
    /** Virtual file object currently being served. */
    readonly file: FileObject;
}

export interface FileTransform<S extends MimeTypedString = MimeTypedString> {
    /** Successful matches of the path component of the request url trigger this tranform. */
    readonly pattern: PathDescription;
    
    /** Whether the request file is **not** required to exist. */
    readonly virtual?: boolean;
    
    render_async(request: FileTransformRequest): Promise<S>;
    renderError_async(error: Error, originalRequest: FileTransformRequest): Promise<S>;
}
