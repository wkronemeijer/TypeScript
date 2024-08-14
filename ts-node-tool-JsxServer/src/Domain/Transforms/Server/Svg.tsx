import {renderSvgError_async, SvgDocument} from "../../ResultTypes/SvgDocument";
import {buildAndRunCjs_async} from "../EvalCjs";
import {isValidElement} from "react";
import {FileTransform} from "../FileTransform";
import {swear} from "@wkronemeijer/system";

export const SvgRenderer: FileTransform<SvgDocument> = {
    pattern: /\.svg\.[jt]sx$/,
    async render_async(request): Promise<SvgDocument> {
        const module = await buildAndRunCjs_async(request);
        const jsx = await module.exports.default;
        swear(isValidElement(jsx), "default export must be a JSX element");
        return SvgDocument(jsx);
    },
    renderError_async: renderSvgError_async,
}
