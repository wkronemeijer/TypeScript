import * as express from "express";

import { ReadonlyURL, formatThrowable, swear, throwableToError } from "@wkronemeijer/system";
import { File, Directory, Path_hasDescendant } from "@wkronemeijer/system-node";

import { ErrorDescription } from "../ResultTypes/ErrorDescription";
import { MimeTypedString } from "../MimeType";
import { FileTransform } from "../Transforms/FileTransform";
import { Response_send } from "./Response";

export function Router_registerFileTransform<T extends MimeTypedString>(
    self: express.Router,
    rootUrl: ReadonlyURL,
    transform: FileTransform<T>,
): void {
    const { 
        pattern, 
        virtual = false, 
        render_async, 
        query_async, 
        renderError_async,
    } = transform;
    const rootDirectory = Directory.fromUrl(rootUrl);
    
    //////////////////
    // Render (GET) //
    //////////////////
    
    if (render_async) {
        self.get(pattern, async (req, res) => {
            const url = new URL(rootUrl + req.url);
            const file = File.fromUrl(url);
            
            let result: MimeTypedString;
            try {
                // TODO: Can this even trigger?
                swear(Path_hasDescendant(rootDirectory.path, file.path), () =>
                    `Requested resource ${file} must be onder the root directory.`
                );
                // IK that async checking for exists is bad
                // alternative is that esbuild or something else downstream creates a more obscure error than this one.
                swear(virtual || await file.exists_async(), () => 
                    `Resource ${file} does not exist.`
                );
                
                result = await render_async({
                    rootUrl, rootDirectory,
                    url, file,
                });
            } catch (render_error) {
                console.log(render_error);
                try {
                    if (renderError_async && render_error instanceof Error) {
                        result = await renderError_async({
                            error: render_error,
                            rootUrl, rootDirectory,
                            url, file,
                        });
                    } else {
                        result = ErrorDescription(render_error);
                    }
                } catch (renderError_error) {
                    console.log(renderError_error);
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
