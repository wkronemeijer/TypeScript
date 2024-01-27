import * as esbuild from "esbuild";
import { fileURLToPath } from "url";

import { swear } from "@wkronemeijer/system";

import { JavaScriptScript } from "../../ResultTypes/JavaScriptScript";
import { FileTransform } from "../PageTransform";
import { ESTarget } from "../../Extensions/BuildResult";

const ClientSideCodePattern = /\.[jt]sx?$/; 

function isClientSideCode(filePath: string) {
    return ClientSideCodePattern.test(filePath);
}

export const ClientJavaScriptRenderer: FileTransform<JavaScriptScript> = {
    pattern: ClientSideCodePattern,
    async render_async({ file, url }): Promise<JavaScriptScript> {
        swear(await file.exists_async(), () => 
            `${file} does not exist.`
        );
        const filePath = file.path;
        
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
        const result = buildResult.outputFiles?.[0]?.text ?? "";
        return JavaScriptScript(result);
    },
    async renderError_async({ error }) {
        const message = error.stack?.replaceAll("`", "\xB4");
        return JavaScriptScript(`document.body.append(String.raw\`${message}\`);`);
    },
}
