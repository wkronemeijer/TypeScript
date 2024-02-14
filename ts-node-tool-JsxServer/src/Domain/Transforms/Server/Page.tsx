import { buildAndRunCjs } from "./EvalCjs";
import { isValidElement } from "react";
import { FileTransform } from "../FileTransform";
import { HtmlDocument } from "../../ResultTypes/HtmlDocument";
import { swear } from "@wkronemeijer/system";

export const ReactPagePattern = /\.page\.[jt]sx$/;

// ↓ must be exported so an index can be created.
export function isReactPage(filePath: string) {
    return ReactPagePattern.test(filePath);
}

export const ReactPageRenderer: FileTransform<HtmlDocument> = {
    pattern: ReactPagePattern,
    async render_async(request): Promise<HtmlDocument> {
        const module = await buildAndRunCjs(request);
        const jsx = await module.exports.default;
        swear(isValidElement(jsx), "'default' export was not a JSX element.");
        return HtmlDocument(jsx);
    },
    async renderError_async(error) {
        return HtmlDocument(<html>
            <head>
                <title>{`${error.name}`}</title>
            </head>
            <body>
                <div style={{
                    color: "red",
                    whiteSpace: "pre-wrap",
                }}>
                    {error.stack}
                </div>
            </body>
        </html>);
    },
}
