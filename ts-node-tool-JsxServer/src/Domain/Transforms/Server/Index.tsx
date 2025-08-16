import {HtmlDocument, MetaViewport, renderHtmlError_async} from "../../ResultTypes/HtmlDocument";
import {collect, compare, from, Ordering} from "@wkronemeijer/system";
import {DirectoryObject, FileObject} from "@wkronemeijer/system-node";
import {ReactPagePattern} from "./Page";
import {FileTransform} from "../FileTransform";
import {ReactNode} from "react";

function isReactPage(object: FileObject): boolean {
    return ReactPagePattern.test(object.path); 
    // technically express matches against URLs, 
    // but our pattern only matches at the end (which is the same for the path and url)
}

const FaviconPattern = /favicon\./i;

function isFavicon(object: FileObject): boolean {
    return FaviconPattern.test(object.path); 
}

const RaspPrefixPattern = /(?<=^|\/)rasp\-/g;
const IndexPattern = /\/[Ii]ndex$/;

interface IndexEntry {
    readonly root: DirectoryObject;
    readonly name: string;
    readonly page: FileObject;
    readonly pageUri: string;
    readonly favicon: FileObject | undefined;
    readonly faviconUri: string | undefined;
}

function IndexEntry({root, page, favicon}: {
    readonly root: DirectoryObject; 
    readonly page: FileObject; 
    readonly favicon?: FileObject | undefined;
}): IndexEntry {
    const pageUri = root.urlTo(page);
    const faviconUri = favicon && root.urlTo(favicon);
    const name = (
        decodeURIComponent(pageUri)
        .replace(RaspPrefixPattern, "")
        .replace(ReactPagePattern, "")
        .replace(IndexPattern, "")
    );
    return {root, name, page, pageUri, favicon, faviconUri};
}

function IndexEntry_compare(lhs: IndexEntry, rhs: IndexEntry): Ordering {
    return compare(lhs.name.toLowerCase(), rhs.name.toLowerCase());
}

function* iterateIndexEntries(root: DirectoryObject): Generator<IndexEntry> {
    const files    = root.recursiveGetAllFiles();
    const pages    = files.filter(isReactPage);
    const favicons = files.filter(isFavicon);
    
    outer:
    for (const page of pages) {
        for (const favicon of favicons) {
            if (favicon.directory === page.directory) {
                yield IndexEntry({root, page, favicon});
                continue outer;
            } 
        }
        yield IndexEntry({root, page});
    }
}

const FaviconSize = 16;

// From https://stackoverflow.com/a/9967193
const EmptyImageUri = (
    `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`
);

function CIndexEntry({entry: {name, pageUri, faviconUri = EmptyImageUri}}: {
    readonly entry: IndexEntry;
}): ReactNode {
    return <a href={pageUri}>
        <img
            width={FaviconSize} 
            height={FaviconSize}
            src={faviconUri}
            alt={`The favicon for ${name}`}
        />
        <span>
            {name}
        </span>
    </a>;
}

const sequencePages = collect(function*(
    entries: readonly IndexEntry[],
): Generator<ReactNode> {
    for (const entry of entries) {
        yield <CIndexEntry key={entry.page.path} entry={entry}/>
    }
});

function RedirectIfUnambigous({entries: [firstEntry, ...otherEntries]}: {
    readonly entries: readonly IndexEntry[];
}): ReactNode {
    if (firstEntry && otherEntries.length === 0) {
        const target = firstEntry.pageUri;
        return <meta httpEquiv="refresh" content={`0;url=${target}`}/>
    } else {
        return <></>
    }
}

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
    columns: 400px;
    gap: 4px;
}
a {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    padding: 4px;
}
a:hover {
    background-color: currentcolor;
    -webkit-text-fill-color: white;
    text-fill-color: white;
    text-decoration: none;
}
a img {
    display: block;
}
a span {
    flex-grow: 1;
}
`.trim();

export const IndexRenderer: FileTransform<HtmlDocument> = {
    pattern: "/",
    virtual: true,
    async render_async({root}) {
        const title = `Index of ${root.name}`;
        const entries = (
            from(iterateIndexEntries(root))
            .orderBy(IndexEntry_compare)
            .toArray()
        );
        return HtmlDocument(<html>
            <head>
                <title>{title}</title>
                <MetaViewport/>
                <RedirectIfUnambigous entries={entries}/>
                <style>{IndexStyle}</style>
            </head>
            <body>
                <header>
                    <h1>{title}</h1>
                    <h2>{entries.length} entries</h2>
                </header>
                <main>
                    {sequencePages(entries)}
                </main>
            </body>
        </html>);
    },
    renderError_async: renderHtmlError_async,
}
