import { ReadonlyURL } from "@wkronemeijer/system";

import { MimeTypedString } from "../MimeType";
import { File, Directory } from "@wkronemeijer/system-node";

interface FileTransform_MethodOptions {
    /** `file:` URL which is the root of what is being served. */
    readonly rootUrl: ReadonlyURL;
    /** Directory object being used as the root. */
    readonly rootDirectory: Directory;
    
    /** Virtual `file:` URL currently being served. */
    readonly url: ReadonlyURL;
    /** Virtual file object currently being served. */
    readonly file: File;
    
    // Q: Should get/post/put/etc. be seperate methods or not?
    // Typically, in our case, only one endpoint would be supported anyway.
    // Forgetting swear(req.method === "GET") is silly
    // Registering the route is going to get really fun with 8 methods
}

export interface FileTransform_RenderOptions 
extends FileTransform_MethodOptions {
    
}

export interface FileTransform_QueryOptions 
extends FileTransform_MethodOptions {
    readonly rawBody: string;
    readonly body: unknown;
}

export interface FileTransform_RenderErrorOptions 
extends FileTransform_MethodOptions {
    readonly error: Error;
}

export interface FileTransform<S extends MimeTypedString> {
    readonly pattern: RegExp;
    /** Whether the request file doesn't have to actually exist on disk. */
    readonly virtual?: boolean;
    
    readonly render_async?: (params: FileTransform_RenderOptions) => Promise<S>;
    readonly query_async?: (params: FileTransform_QueryOptions) => Promise<S>;
    
    readonly renderError_async?: (params: FileTransform_RenderErrorOptions) => Promise<S>;
}
