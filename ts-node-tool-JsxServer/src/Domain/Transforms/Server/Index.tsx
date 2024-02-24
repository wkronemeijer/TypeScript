import { HtmlDocument, SimpleHtmlDocument, renderHtmlError_async } from "../../ResultTypes/HtmlDocument";
import { RelativePath_toUrl } from "@wkronemeijer/system-node";
import { from, singularize } from "@wkronemeijer/system";
import { Link, isReactPage } from "./Page";
import { FileTransform } from "../FileTransform";

export const IndexRenderer: FileTransform<HtmlDocument> = {
    pattern: "/",
    virtual: true,
    async render_async({rootDirectory}) {
        const title = `Index of ${rootDirectory.fullName}`;
        const pages = (
            from(rootDirectory.recursiveGetAllFiles())
            .where(file => isReactPage(file.path))
            .toArray()
        );
        
        return SimpleHtmlDocument(title, <>
            <h1>{title} ({singularize(pages.length, "pages")})</h1>
            <ul>
                {pages.map(page => 
                <li key={page.path}>
                    <Link href={RelativePath_toUrl(rootDirectory.to(page))}/>
                </li>)}
            </ul>
        </>);
    },
    renderError_async: renderHtmlError_async,
}
