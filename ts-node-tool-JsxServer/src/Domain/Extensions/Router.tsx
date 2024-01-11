import * as express from "express";

import { ReadonlyURL, swear } from "@wkronemeijer/system";

import { MimeTypedString } from "../MimeType";
import { FileTransform } from "../PageTransform";
import { CONTENT_TYPE } from "../HttpHeader";

export function Router_registerFileTransform<T extends MimeTypedString>(
    self: express.Router,
    rootUrl: ReadonlyURL,
    transform: FileTransform<T>
): void {
    const { pattern, render_async, query_async } = transform;
    if (render_async) {
        self.get(pattern, async (req, res) => {
            try {
                const fileUrl = new URL(rootUrl + req.url);
                swear(fileUrl.href.startsWith(rootUrl.href));
                
                const { type, body } = await render_async(fileUrl);
                res.setHeader(CONTENT_TYPE, type);
                res.send(body);
            } catch (e) {
                res.setHeader(CONTENT_TYPE, "text/plain");
                res.send(e instanceof Error ? e.stack : String(e));
            }
        });
    }
    if (query_async) {
        __NOT_IMPLEMENTED();
        // Something like:
        // self.post(pattern, async (req, res) => {...});
    }
}
