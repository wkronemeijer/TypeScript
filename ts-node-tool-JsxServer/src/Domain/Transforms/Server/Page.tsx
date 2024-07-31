import {HtmlDocument, renderHtmlError_async} from "../../ResultTypes/HtmlDocument";
import {buildAndRunCjs} from "./EvalCjs";
import {isValidElement} from "react";
import {FileTransform} from "../FileTransform";
import {swear} from "@wkronemeijer/system";

export const ReactPagePattern = /\.page\.[jt]sx$/;

export const ReactPageRenderer: FileTransform<HtmlDocument> = {
    pattern: ReactPagePattern,
    async render_async(request): Promise<HtmlDocument> {
        const module = await buildAndRunCjs(request);
        const jsx = await module.exports.default;
        swear(isValidElement(jsx), "default export was not a JSX element");
        return HtmlDocument(jsx);
    },
    renderError_async: renderHtmlError_async,
}
