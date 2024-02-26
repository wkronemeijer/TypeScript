import * as express from "express";

import { FileTransform, FileTransformRequest } from "../Transforms/FileTransform";
import { FileObject, DirectoryObject } from "@wkronemeijer/system-node";
import { ReadonlyURL, swear } from "@wkronemeijer/system";
import { ErrorDescription } from "../ResultTypes/ErrorDescription";
import { MimeTypedString } from "../MimeType";
import { Response_send } from "./Response";

export function Router_registerFileTransform<T extends MimeTypedString>(
    self: express.Router,
    rootUrl: ReadonlyURL,
    transform: FileTransform<T>,
): void {
    const root = DirectoryObject.fromUrl(rootUrl);
    const {
        pattern, 
        virtual = false, 
        render_async, 
        renderError_async,
    } = transform;
    
    self.get(pattern, async (req, res) => {
        const url = new URL(rootUrl + req.url);
        const file = FileObject.fromUrl(url);
        const requestInfo: FileTransformRequest = {
            rootUrl, root, url, file,
        };
        
        let result: MimeTypedString;
        try {
            swear(file.extends(root), () => 
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
            console.error(render_error);
            try {
                if (render_error instanceof Error) {
                    result = await renderError_async(render_error, requestInfo);
                } else {
                    result = ErrorDescription(render_error);
                }
            } catch (renderError_error) {
                console.error(renderError_error);
                result = ErrorDescription(renderError_error);
            }
        }
        Response_send(res, result);
    });
}
