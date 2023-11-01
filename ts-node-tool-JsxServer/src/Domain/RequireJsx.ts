import { swear, Dictionary } from "@wkronemeijer/system";

import * as esbuild from "esbuild";
import { renderToStaticMarkup } from "react-dom/server";
import { isValidElement } from "react";
import { fileURLToPath } from "url";

import { requireInline } from "./RequireInline";

export const ReactFilePattern = /\.page\.[jt]sx$/;

export function isReactFile(filePath: string) {
    return ReactFilePattern.test(filePath);
}

const SearchParameterReplacement = "URL_PARAMS";

export async function renderJsx(fileUrl: URL): Promise<string> {
    const filePath   = fileURLToPath(fileUrl);
    swear(isReactFile(filePath), () => 
        `'${filePath}' does not lead to a react file.`);
    
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
    
    const mod = requireInline({ 
        filePath, 
        sourceCode, 
    });
    const jsx = mod.exports.default;
    swear(isValidElement(jsx), 
        "'default' export was not a JSX element.");
    const html = renderToStaticMarkup(jsx);
    return `<!DOCTYPE html>${html}`;
}
