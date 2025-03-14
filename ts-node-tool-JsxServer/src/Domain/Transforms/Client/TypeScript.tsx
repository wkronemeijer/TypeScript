import {checkUsesBundleSuffix} from "../CheckBundle";
import {JavaScriptScript} from "../../ResultTypes/JavaScriptScript";
import {buildIife_async} from "../EvalCjs";
import {FileTransform} from "../FileTransform";

export const TypeScriptRenderer: FileTransform<JavaScriptScript> = {
    pattern: /\.(ts|tsx|jsx)$/, // ignore plain .js
    async render_async(req): Promise<JavaScriptScript> {
        const iife = await buildIife_async(req);
        checkUsesBundleSuffix(req);
        return JavaScriptScript(iife);
    },
    async renderError_async(error) {
        const message = (
            error.stack!
            .replaceAll("`", "\xB4")
        );
        return JavaScriptScript(`document.body.append(String.raw\`\n${message}\n\`);`);
    },
}
