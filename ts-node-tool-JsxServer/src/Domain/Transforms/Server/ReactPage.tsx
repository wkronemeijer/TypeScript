import { isValidElement } from "react";
import * as esbuild from "esbuild";

import { swear, Dictionary } from "@wkronemeijer/system";

import { BuildResult_getOutput, ESTarget } from "../../Extensions/BuildResult";
import { requireString } from "../../RequireString";
import { FileTransform } from "../PageTransform";
import { HtmlDocument } from "../../ResultTypes/HtmlDocument";

export const ReactPagePattern = /\.page\.[jt]sx$/;

// ↓ must be exported so an index can be created.
export function isReactPage(filePath: string) {
    return ReactPagePattern.test(filePath);
}

const SearchParameterReplacement = "__URL_PARAMS";

export const ReactPageRenderer: FileTransform<HtmlDocument> = {
    pattern: ReactPagePattern,
    async render_async({ url, file }): Promise<HtmlDocument> {
        swear(await file.exists_async(), () => 
            `${file} does not exist.`
        );
        
        const paramsObject = Dictionary.from(url.searchParams);
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
            
            define: {
                [SearchParameterReplacement]: JSON.stringify(paramsObject),
            },
        });
        
        const sourceCode = BuildResult_getOutput(buildResult);
        const module = requireString(filePath, sourceCode);
        const jsx = await module.exports.default;
        swear(isValidElement(jsx), "'default' export was not a JSX element.");
        return HtmlDocument(jsx);
    },
    async renderError_async({ error }) {
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
