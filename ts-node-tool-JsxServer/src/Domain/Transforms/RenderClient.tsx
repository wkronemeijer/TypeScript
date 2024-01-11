import { swear } from "@wkronemeijer/system";

import * as esbuild from "esbuild";
import { fileURLToPath } from "url";

import { JavaScriptScript } from "../ResultTypes/JavaScriptScript";
import { FileTransform } from "../PageTransform";
import { ESTarget } from "../Extensions/BuildResult";

const ClientSideCodePattern = /\.[jt]sx?$/; 

function isClientSideCode(filePath: string) {
    return ClientSideCodePattern.test(filePath);
}

async function renderClientSideJsx_async(fileUrl: URL): Promise<JavaScriptScript> {
    let result: string;
    try {
        const filePath = fileURLToPath(fileUrl);
        swear(isClientSideCode(filePath), () => 
            `'${filePath}' does not lead to a script file.`
        );
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

export const ClientJavaScriptRenderer: FileTransform<JavaScriptScript> = {
    pattern: ClientSideCodePattern,
    render_async: renderClientSideJsx_async,
}
