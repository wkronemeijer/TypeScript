import { isValidElement } from "react";
import * as esbuild from "esbuild";

import { swear } from "@wkronemeijer/system";

import { BuildResult_getOutputFile, ESTarget } from "../../Extensions/BuildResult";
import { ShareableDependencies } from "./ShareableDependencies";
import { prepareRequestInfo } from "../../Extensions/DefineMap";
import { requireString } from "../../RequireString";
import { FileTransform } from "../FileTransform";
import { HtmlDocument } from "../../ResultTypes/HtmlDocument";

export const ReactPagePattern = /\.page\.[jt]sx$/;

// ↓ must be exported so an index can be created.
export function isReactPage(filePath: string) {
    return ReactPagePattern.test(filePath);
}

export const ReactPageRenderer: FileTransform<HtmlDocument> = {
    pattern: ReactPagePattern,
    async render_async({ id, url, file }): Promise<HtmlDocument> {
        const filePath = file.path;
        
        const buildResult = await esbuild.build({
            entryPoints: [filePath],
            bundle: true,
            write: false,
            jsx: "automatic",
            
            platform: "node",
            format: "cjs",
            target: [ESTarget],
            
            minifyWhitespace: true,
            sourcemap: "inline",
            
            external: ShareableDependencies.slice(),
            define: prepareRequestInfo({
                id,
                url: url.href,
            }),
        });
        
        const sourceCode = BuildResult_getOutputFile(buildResult);
        const module = requireString(filePath, sourceCode);
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
