import * as esbuild from "esbuild";

import { JavaScriptScript } from "../../ResultTypes/JavaScriptScript";
import { FileTransform } from "../FileTransform";
import { ESTarget } from "../../Extensions/BuildResult";

export const ClientJavaScriptRenderer: FileTransform<JavaScriptScript> = {
    pattern: /\.[jt]sx?$/,
    async render_async({ file }): Promise<JavaScriptScript> {
        const buildResult = await esbuild.build({
            entryPoints: [file.path],
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
        const message = (
            error.stack!
            .replaceAll("`", "\xB4")
        );
        return JavaScriptScript(`document.body.append(String.raw\`\n${message}\n\`);`);
    },
}
