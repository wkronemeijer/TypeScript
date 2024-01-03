import { swear } from "@wkronemeijer/system";

import * as esbuild from "esbuild";
import { fileURLToPath } from "url";

import { ESTarget } from "../Shared/ESBuild";
import { JavaScriptScript } from "./JavaScriptScript";

export const ClientSideCodePattern = /\.[jt]sx?$/; 

export function isClientSideCode(filePath: string) {
    return ClientSideCodePattern.test(filePath);
}

export async function renderClientSideJsx_async(fileUrl: URL): Promise<JavaScriptScript> {
    let result: string;
    try {
        const filePath = fileURLToPath(fileUrl);
        swear(isClientSideCode(filePath), () => 
            `'${filePath}' does not lead to a script file.`);
        const buildResult = await esbuild.build({
            entryPoints: [filePath],
            bundle: true,
            write: false,
            jsx: "automatic",
            charset: "utf8", 
            
            target: [ESTarget],
            platform: "browser",
            
            minifyWhitespace: true,
            sourcemap: "inline",
        });
        result = buildResult.outputFiles?.[0]?.text ?? "";
    } catch (e) {
        swear(e instanceof Error, `'${e}' is not an Error.`);
        result = `document.body.append(String.raw\`${e.stack}\`);`;
    }
    return JavaScriptScript(result);
}
