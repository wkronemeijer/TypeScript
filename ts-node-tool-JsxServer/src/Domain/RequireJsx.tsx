import { swear, Dictionary } from "@wkronemeijer/system";

import * as esbuild from "esbuild";
import { isValidElement } from "react";
import { fileURLToPath } from "url";

import { requireInline } from "./RequireInline";
import { HtmlDocument } from "./HtmlDocument";

export const ReactPagePattern = /\.page\.[jt]sx$/;

export function isReactPage(filePath: string) {
    return ReactPagePattern.test(filePath);
}

const SearchParameterReplacement = "URL_PARAMS";

export async function renderServerSideJsx(fileUrl: URL): Promise<HtmlDocument> {
    let result: JSX.Element;
    try {
        const filePath = fileURLToPath(fileUrl);
        swear(isReactPage(filePath), "filePath does not lead to a react file.");
        const paramsObject = Dictionary.from(fileUrl.searchParams);
        
        const buildResult = await esbuild.build({
            entryPoints: [filePath],
            bundle: true,
            write: false,
            format: "cjs",
            sourcemap: "inline",
            jsx: "automatic",
            charset: "utf8", // not the default? wut
            define: {
                [SearchParameterReplacement]: JSON.stringify(paramsObject),
            },
        });
        
        const sourceCode = buildResult.outputFiles?.[0]?.text ?? "";
        const module     = requireInline(filePath, sourceCode);
        const jsx        = module.exports.default;
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
        </html>
    }
    return HtmlDocument(result);
}

/////////////////
// Client side //
/////////////////

export const ClientSideCodePattern = /\.[jt]sx?$/; 

export function isClientSideCode(filePath: string) {
    return ClientSideCodePattern.test(filePath);
}

export async function renderClientSideJsx(fileUrl: URL): Promise<string> {
    let result: string;
    try {
        const filePath = fileURLToPath(fileUrl);
        swear(isClientSideCode(filePath), "filePath does not lead to a script file.");
        const buildResult = await esbuild.build({
            entryPoints: [filePath],
            bundle: true,
            write: false,
            format: "iife",
            sourcemap: "inline",
            jsx: "automatic",
            charset: "utf8", 
        });
        result = buildResult.outputFiles?.[0]?.text ?? "";
    } catch (e) {
        swear(e instanceof Error, "Non-Error thrown.");
        result = `document.body.append(String.raw\`${e.stack}\`);`;
    }
    return result;
}
