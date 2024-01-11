import { fileURLToPath } from "url";
import * as scss from "sass-embedded";

import { FileTransform } from "../PageTransform";
import { CssStylesheet } from "../ResultTypes/CssStylesheet";
import { stringifyJson, swear } from "@wkronemeijer/system";
import { getRelativeUrl } from "../Handlers/RenderIndex";
import { AbsolutePath, Path_relative, RelativePath, RelativePath_toUrl } from "@wkronemeijer/system-node";

const encoding: BufferEncoding = "utf-8";

export const StylesheetRenderer: FileTransform<CssStylesheet> = {
    pattern: /\.scss$/,
    async render_async(url) {
        const path = fileURLToPath(url);
        const compileResult = await scss.compileAsync(path, {
            sourceMap: true,
            sourceMapIncludeSources: true,
        });
        
        const sourceMap = compileResult.sourceMap;
        swear(sourceMap, "missing sourcemap");
        
        sourceMap.sources = sourceMap.sources.map(fileUrl => {
            const source        = AbsolutePath(path);
            const target        = AbsolutePath(fileURLToPath(fileUrl));
            const relativePath  = Path_relative(source, target);
            const relativeUrl   = RelativePath_toUrl(relativePath);
            return relativeUrl;
        });
        
        // https://github.com/sass/dart-sass/issues/1594#issuecomment-1013208452
        // embedding source maps has to be done manually
        
        const jsonSourceMap        = stringifyJson(sourceMap);
        const base64JsonSourceMap  = Buffer.from(jsonSourceMap, encoding).toString("base64");
        const sourceMapComment     = `/*# sourceMappingURL=data:application/json;charset=${encoding};base64,${base64JsonSourceMap} */`;
        
        const css = `${compileResult.css}\n\n${sourceMapComment}`;
        return CssStylesheet(css);
    },
}
