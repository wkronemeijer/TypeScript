
import { ReadonlyURL } from "@wkronemeijer/system";

import { MimeTypedString } from "../MimeType";

interface FileTransformRenderOptions {
    /** Virtual `file:` URL currently being served. */
    readonly url: ReadonlyURL;
    /** `file:` URL which is the root of what is being served. */
    readonly rootUrl: ReadonlyURL;
    
    // Q: Should get/post/put/etc. be seperate methods or not?
    // Typically, in our case, only one endpoint would be supported anyway.
    // Forgetting swear(req.method === "GET") is silly
    // Registering the route is going to get really fun with 8 methods
}

export interface FileTransform<T extends MimeTypedString> {
    readonly pattern: RegExp;
    readonly render_async?: (url: ReadonlyURL) => Promise<T>;
    readonly query_async?: (url: ReadonlyURL, body: unknown) => Promise<T>;
}
