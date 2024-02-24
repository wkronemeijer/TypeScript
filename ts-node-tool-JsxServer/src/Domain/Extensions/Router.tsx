import * as express from "express";

import { FileTransform, FileTransformRequest } from "../Transforms/FileTransform";
import { ReadonlyURL, swear } from "@wkronemeijer/system";
import { ErrorDescription } from "../ResultTypes/ErrorDescription";
import { File, Directory } from "@wkronemeijer/system-node";
import { MimeTypedString } from "../MimeType";
import { Response_send } from "./Response";

export function Router_registerFileTransform<T extends MimeTypedString>(
    self: express.Router,
    rootUrl: ReadonlyURL,
    transform: FileTransform<T>,
): void {
    const rootDirectory = Directory.fromUrl(rootUrl);
    const {
        pattern, 
        virtual = false, 
        render_async, 
        renderError_async,
    } = transform;
    
    self.get(pattern, async (req, res) => {
        const url = new URL(rootUrl + req.url);
        const file = File.fromUrl(url);
        const requestInfo: FileTransformRequest = {
            rootUrl, rootDirectory,
            url, file,
        };
        
        let result: MimeTypedString;
        try {
            swear(file.extends(rootDirectory), () => 
                `requested resource ${file} must be at or under the root`
            );
            // IK that (async) checking for exists is bad
            // alternative is that esbuild or something else downstream creates a more obscure error
            // while we know the exact problem right here.
            swear(virtual || file.exists(), () => 
                `resource ${file} does not exist (and is not virtual)`
            );
            result = await render_async(requestInfo);
        } catch (render_error) {
            console.log(render_error);
            try {
                if (render_error instanceof Error) {
                    result = await renderError_async(render_error, requestInfo);
                } else {
                    result = ErrorDescription(render_error);
                }
            } catch (renderError_error) {
                console.log(renderError_error);
                result = ErrorDescription(renderError_error);
            }
        } finally {
            // Dispose of request (noop for now)
        }
        Response_send(res, result);
    });
}
