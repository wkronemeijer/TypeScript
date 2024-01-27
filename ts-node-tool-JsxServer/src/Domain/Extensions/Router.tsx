import * as express from "express";

import { File, Directory } from "@wkronemeijer/system-node";
import { ReadonlyURL, formatThrowable } from "@wkronemeijer/system";

import { ErrorDescription } from "../ResultTypes/ErrorDescription";
import { MimeTypedString } from "../MimeType";
import { FileTransform } from "../Transforms/PageTransform";
import { Response_send } from "./Response";

export function Router_registerFileTransform<T extends MimeTypedString>(
    self: express.Router,
    rootUrl: ReadonlyURL,
    transform: FileTransform<T>,
): void {
    const { pattern, render_async, query_async, renderError_async } = transform;
    const rootDirectory = Directory.fromUrl(rootUrl);
    
    //////////////////
    // Render (GET) //
    //////////////////
    
    if (render_async) {
        self.get(pattern, async (req, res) => {
            const url = new URL(rootUrl + req.url);
            const file = File.fromUrl(url);
            // FIXME: Ensure the fileUrl doesn't escape the root
            
            let result: MimeTypedString;
            try {
                result = await render_async({
                    rootUrl, rootDirectory,
                    url, file,
                });
            } catch (render_error) {
                console.log(formatThrowable(render_error));
                try {
                    if (render_error instanceof Error && renderError_async) {
                        result = await renderError_async({
                            error: render_error,
                            rootUrl, rootDirectory,
                            url, file,
                        });
                    } else {
                        result = ErrorDescription(render_error);
                    }
                } catch (renderError_error) {
                    // Feels like Error#cause should be used somewhere here...
                    console.log(formatThrowable(renderError_error));
                    result = ErrorDescription(renderError_error);
                }
            }
            Response_send(res, result);
        });
    }
    
    //////////////////
    // Query (POST) //
    //////////////////
    // TODO: Maybe just call the methods get_async and post_async instead
    
    if (query_async) {
        __NOT_IMPLEMENTED();
        // Something like:
        // self.post(pattern, async (req, res) => {...});
        // Mind you, bundling a file, running it for each request is a little very inefficient
        // Needs caching at that point 😬
    }
}
