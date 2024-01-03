import { swear, Dictionary } from "@wkronemeijer/system";

import * as esbuild from "esbuild";
import { isValidElement } from "react";
import { fileURLToPath } from "url";

import { BuildResult_getOutput, ESTarget } from "../Shared/ESBuild";
import { requireInline } from "../RequireInline";
import { HtmlDocument } from "./HtmlDocument";

export const ReactPagePattern = /\.page\.[jt]sx$/;

export function isReactPage(filePath: string) {
    return ReactPagePattern.test(filePath);
}

const SearchParameterReplacement = "__URL_PARAMS";

export async function renderServerSideJsx_async(fileUrl: URL): Promise<HtmlDocument> {
    let result: JSX.Element;
    try {
        const filePath = fileURLToPath(fileUrl);
        swear(isReactPage(filePath), "filePath does not lead to a react file.");
        const paramsObject = Dictionary.from(fileUrl.searchParams);
        
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
        const module = requireInline(filePath, sourceCode);
        const jsx = await module.exports.default;
        swear(isValidElement(jsx), "'default' export was not a JSX element.");
        result = jsx;
    } catch (e) {
        swear(e instanceof Error, "Non-Error thrown.");
        result = <html>
            <head>
                <title>{e.name}</title>
            </head>
            <body>
                <div style={{
                    color: "red",
                    whiteSpace: "pre-wrap",
                }}>
                    {e.stack}
                </div>
            </body>
        </html>;
    }
    return HtmlDocument(result);
}
