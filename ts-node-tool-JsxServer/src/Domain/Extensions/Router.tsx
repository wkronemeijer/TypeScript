import * as express from "express";

import { File, Directory, Path_hasDescendant } from "@wkronemeijer/system-node";
import { ReadonlyURL, swear } from "@wkronemeijer/system";

import { FileTransform, FileTransformRequest } from "../Transforms/FileTransform";
import { ErrorDescription } from "../ResultTypes/ErrorDescription";
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
            // TODO: Can this even trigger?
            swear(Path_hasDescendant(rootDirectory.path, file.path), () => 
                `Requested resource ${file} must be onder the root directory.`
            );
            // IK that (async) checking for exists is bad
            // alternative is that esbuild or something else downstream creates a more obscure error
            // while we know the exact problem right here.
            swear(virtual || file.exists(), () => 
                `Resource ${file} does not exist.`
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
