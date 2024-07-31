import {HtmlDocument, MetaViewport, renderHtmlError_async} from "../../ResultTypes/HtmlDocument";
import {DirectoryObject, FileObject} from "@wkronemeijer/system-node";
import {collect, from, singularize} from "@wkronemeijer/system";
import {ReactPagePattern} from "./Page";
import {FileTransform} from "../FileTransform";
import {ReactNode} from "react";

const IndexStyle = String.raw`
body {
    margin: 16px;
    font-family: sans-serif;
}
header {
    padding-bottom: 4px;
    border-bottom: 1px solid black;
    margin-bottom: 4px;
}
h1 {
    margin: 0;
}
h2 {
    margin: 0;
    font-weight: normal;
}
h3 {
    margin: 0;
}
main {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-items: start;
    gap: 4px;
    width: max-content;
    height: 80vh;
}
a {
    display: block;
    border-radius: 4px;
    padding: 4px;
}
a:hover {
    background-color: currentcolor;
    -webkit-text-fill-color: white;
    text-fill-color: white;
    text-decoration: none;
}
`.trim();

function CLink(props: {
    readonly href: string;
}): JSX.Element {
    const { href } = props;
    return <a href={href}>
        {decodeURIComponent(href).replace(ReactPagePattern, "")}
    </a>;
}

const sequencePages = collect(function*(
    root: FileObject,
    pages: FileObject[], 
): Generator<ReactNode> {
    for (const page of pages) {
        yield <CLink key={page.path} href={root.urlTo(page)}/>
    }
});

// TODO: Could be a component
// But all the `root={root} pages={pages}` didn't seem worth it
function redirectIfUnambigous(root: DirectoryObject, pages: readonly FileObject[]): ReactNode {
    let page;
    return <>
        {pages.length === 1 && (page = pages[0]) && 
        <meta httpEquiv="refresh" content={`0;url=${root.urlTo(page)}`}/>} 
    </>
}

function isReactPage(object: FileObject) {
    return ReactPagePattern.test(object.path); 
    // technically express matches against URLs, 
    // but our pattern only matches at the end (which is the same for the path and url)
}

export const IndexRenderer: FileTransform<HtmlDocument> = {
    pattern: "/",
    virtual: true,
    async render_async({ root }) {
        // TODO: Rework this to generate the index of any page?
        // In a way, its more of a sitemap
        // Also it is specific to the root
        const title = `Index of ${root.name}`;
        const pages = (
            from(root.recursiveGetAllFiles())
            .where(isReactPage)
            .toArray()
        );
        return HtmlDocument(<html>
            <head>
                <title>{`${title}`}</title>
                <MetaViewport/>
                {redirectIfUnambigous(root, pages)}
                <style>{IndexStyle}</style>
            </head>
            <body>
                <header>
                    <h1>{title}</h1>
                    <h2>{singularize(pages.length, "pages")}</h2>
                </header>
                <main>
                    {sequencePages(root, pages)}
                </main>
            </body>
        </html>);
    },
    renderError_async: renderHtmlError_async,
}
