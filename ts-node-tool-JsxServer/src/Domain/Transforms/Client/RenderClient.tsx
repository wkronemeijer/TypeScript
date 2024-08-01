import {BuildResult_getOutputFile, ESTarget} from "../../Extensions/BuildResult";
import {JavaScriptScript} from "../../ResultTypes/JavaScriptScript";
import {FileTransform} from "../FileTransform";
import {esbuild} from "../../../lib";

export const JavaScriptRenderer: FileTransform<JavaScriptScript> = {
    pattern: /\.[jt]sx?$/,
    async render_async({file}): Promise<JavaScriptScript> {
        const filePath = file.path;
        const buildResult = await esbuild.build({
            entryPoints: [filePath],
            bundle: true,
            write: false,
            jsx: "automatic",
            charset: "utf8", 
            
            platform: "browser",
            target: [ESTarget],
            
            minify: true,
            keepNames: true,
            // sourcemap: "inline",
        });
        const result = BuildResult_getOutputFile(buildResult);
        return JavaScriptScript(result);
    },
    async renderError_async(error) {
        const message = (
            error.stack!
            .replaceAll("`", "\xB4")
        );
        return JavaScriptScript(`document.body.append(String.raw\`\n${message}\n\`);`);
    },
}
