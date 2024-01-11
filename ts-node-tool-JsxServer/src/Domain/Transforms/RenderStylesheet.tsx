import { fileURLToPath } from "url";
import * as scss from "sass-embedded";

import { FileTransform } from "../PageTransform";
import { CssStylesheet } from "../ResultTypes/CssStylesheet";

export const StylesheetRenderer: FileTransform<CssStylesheet> = {
    pattern: /\.scss$/,
    async render_async(url) {
        const path = fileURLToPath(url);
        const result = await scss.compileAsync(path, {
            sourceMap: true,
            sourceMapIncludeSources: true,
            // embed source maps?
        });
        return CssStylesheet(result.css);
    },
}
