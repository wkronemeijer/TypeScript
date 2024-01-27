import { fileURLToPath } from "url";
import { RawSourceMap } from "source-map-js";
import * as scss from "sass-embedded";

import { AbsolutePath, Path_relative, RelativePath_toUrl } from "@wkronemeijer/system-node";
import { stringifyJson, swear } from "@wkronemeijer/system";

import { FileTransform } from "../PageTransform";
import { CssStylesheet } from "../../ResultTypes/CssStylesheet";

function SourceMap_relativize(self: RawSourceMap, path: AbsolutePath): RawSourceMap {
    const newSources = self.sources.map(fileUrl => {
        const source = path;
        const target = AbsolutePath(fileURLToPath(fileUrl));
        return RelativePath_toUrl(Path_relative(source, target));
    });
    return { ...self, sources: newSources };
}

const encoding: BufferEncoding = "utf-8";

// Based on https://github.com/sass/dart-sass/issues/1594#issuecomment-1013208452
function SourceMap_toCssComment(self: RawSourceMap): string {
    const json       = stringifyJson(self);
    const base64json = Buffer.from(json, encoding).toString("base64");
    return `/*# sourceMappingURL=data:application/json;charset=${encoding};base64,${base64json} */`;
}

const AnsiEscapeSequence = /\x1B\[\d{1,2}m/g;

export const StylesheetRenderer: FileTransform<CssStylesheet> = {
    pattern: /\.scss$/,
    async render_async({ file }) {
        const path = file.path;
        const compileResult = await scss.compileAsync(path, {
            sourceMap: true,
            sourceMapIncludeSources: true,
        });
        const absoluteSourceMap = compileResult.sourceMap;
        swear(absoluteSourceMap, "missing sourcemap");
        const relativeSourceMap = SourceMap_relativize(absoluteSourceMap, path);
        const sourceMapComment  = SourceMap_toCssComment(relativeSourceMap);
        return CssStylesheet(`${compileResult.css}\n\n${sourceMapComment}`);
    },
    async renderError_async({ error }) {
        const message = (
            error.stack
            ?.replaceAll("*/", "*\u200B/")
            ?.replaceAll(AnsiEscapeSequence, "")
        );
        return CssStylesheet(`/*\n${message}\n*/\nbody { color: red; }\n`);
    },
}
