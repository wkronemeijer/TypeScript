import { isValidElement } from "react";
import * as esbuild from "esbuild";

import { swear } from "@wkronemeijer/system";

import { BuildResult_getOutputFile, ESTarget } from "../../Extensions/BuildResult";
import { prepareRequestInfo } from "../../Extensions/DefineMap";
import { requireString } from "../../RequireString";
import { FileTransform } from "../FileTransform";
import { HtmlDocument } from "../../ResultTypes/HtmlDocument";

import { dependencies } from "../../../../package.json";

export const ShareableDependencies: readonly string[] = [
    "@wkronemeijer/system",
    "@wkronemeijer/system-node",
    // Note: @wkronemeijer/react-server-page should never be shared;
    // it has to included in the page bundle for it to work.
] satisfies (keyof typeof dependencies)[];

export const ReactPagePattern = /\.page\.[jt]sx$/;

// ↓ must be exported so an index can be created.
export function isReactPage(filePath: string) {
    return ReactPagePattern.test(filePath);
}

export const ReactPageRenderer: FileTransform<HtmlDocument> = {
    pattern: ReactPagePattern,
    async render_async({ url, file }): Promise<HtmlDocument> {
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
