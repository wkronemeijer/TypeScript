import {FileTransform, FileTransformRequest} from "../FileTransform";
import {JavaScriptScript} from "../../ResultTypes/JavaScriptScript";
import {buildIife_async} from "../EvalCjs";
import {terminal} from "@wkronemeijer/ansi-console";

const FuturePattern = /\.bundle\.(ts|tsx|jsx)$/;

function checkIsFutureCompatible(req: FileTransformRequest): void {
    const href = req.partialRequestUrl;
    if (!FuturePattern.test(href)) {
        terminal.warn(
            `requesting '${href}' without a .bundle suffix is deprecated`
        );
    }
}

export const TypeScriptRenderer: FileTransform<JavaScriptScript> = {
    pattern: /\.(ts|tsx|jsx)$/, // ignore plain .js
    async render_async(req): Promise<JavaScriptScript> {
        const iife = await buildIife_async(req);
        checkIsFutureCompatible(req);
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
