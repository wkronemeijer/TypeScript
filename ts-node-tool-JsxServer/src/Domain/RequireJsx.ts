import { swear, terminal } from "@wkronemeijer/system";

import * as esbuild from "esbuild";
import { renderToStaticMarkup } from "react-dom/server";

export const ReactFilePattern = /\.page\.[jt]sx$/;

export function isReactFile(filePath: string) {
    return ReactFilePattern.test(filePath);
}

function requireInline(filePath: string, sourceCode: string): any {
    // from https://stackoverflow.com/a/47002752
    const mod = new (module.constructor as any)();
    mod.paths = module.paths;
    mod._compile(sourceCode, filePath);
    return mod.exports;
}

export async function renderJsx(filePath: string): Promise<string> {
    swear(isReactFile(filePath));
    const buildResult = await esbuild.build({
        entryPoints: [filePath],
        bundle: true,
        write: false,
        format: "cjs",
        jsx: "automatic",
    });
    const sourceCode = buildResult.outputFiles?.[0]?.text ?? "";
    
    const mod  = requireInline(filePath, sourceCode);
    const jsx  = mod.default;
    const html = renderToStaticMarkup(jsx);
    
    return `<!DOCTYPE html>${html}`;
}
