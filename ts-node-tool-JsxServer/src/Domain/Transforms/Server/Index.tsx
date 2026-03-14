import {HtmlDocument, MetaViewport, renderHtmlError_async} from "../../ResultTypes/HtmlDocument";
import {DirectoryObject, FileObject} from "@wkronemeijer/system-node";
import {collect, compare, Ordering} from "@wkronemeijer/system";
import {ReactPagePattern} from "./Page";
import {Array$fromAsync} from "../../../Core/Array";
import {FileTransform} from "../FileTransform";
import {isPathValid} from "ignore";
import {ReactNode} from "react";

import ignore = require("ignore");

/////////////////
// Index entry //
/////////////////

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
    const pageUri    = root.urlTo(page);
    const faviconUri = favicon && root.urlTo(favicon);
    const name = (
        decodeURIComponent(pageUri)
        .replace(RaspPrefixPattern, "")
        .replace(ReactPagePattern, "")
        .replace(IndexPattern, "")
    );
    return {root, name, page, pageUri, favicon, faviconUri};
}

function IndexEntry$compare(lhs: IndexEntry, rhs: IndexEntry): Ordering {
    return compare(lhs.name.toLowerCase(), rhs.name.toLowerCase());
}

/////////////////////
// Finding entries //
/////////////////////

const IgnoreFileName = ".raspignore";

type Ignore = ReturnType<typeof ignore>;

class IgnoreList {
    private readonly ignores = new Array<{
        readonly dir: DirectoryObject;
        readonly ig: Ignore;
    }>();
    
    constructor() {}
    
    register(dir: DirectoryObject, ig: Ignore): void {
        this.ignores.push({dir, ig});
    }
    
    accepts = (file: FileObject): boolean => {
        for (const {dir, ig} of this.ignores) {
            const path = dir.to(file);
            if (isPathValid(path) && ig.ignores(path)) {
                return false;
            }
        }
        return true;
    }
}

async function* recursiveGetAllFiles(
    root: DirectoryObject,
): AsyncGenerator<FileObject> {
    const bouncer  = new IgnoreList;
    const frontier = [root];
    
    let dir: DirectoryObject | undefined;
    while (dir = frontier.shift()) {
        // Check local .raspignore
        try {
            const rules = await dir.join(IgnoreFileName).readText_async();
            const ig = ignore().add(rules);
            bouncer.register(dir, ig);
        } catch {/* No such file */}
        
        const files = await dir.readContents_async();
        
        for (const file of files) {
            if (bouncer.accepts(file)) {
                if (file.isDirectory()) {
                    frontier.push(file);
                } else {
                    yield file;
                }
            }
        }
    }
}

async function findFavicon(file: FileObject): Promise<FileObject | undefined> {
    const siblings = await file.parent.readContents_async();
    for (const sibling of siblings) {
        if (isFavicon(sibling)) {
            return sibling;
        }
    }
}

async function* iterateIndexEntries(
    root: DirectoryObject,
): AsyncGenerator<IndexEntry> {
    for await (const page of recursiveGetAllFiles(root)) {
        if (isReactPage(page)) {
            const favicon = await findFavicon(page);
            yield IndexEntry({root, page, favicon});
        }
    }
}

/////////////////
// CIndexEntry //
/////////////////

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

function RedirectIfUnambigous({entries: [first, ...rest]}: {
    readonly entries: readonly IndexEntry[];
}): ReactNode {
    if (!(first !== undefined && rest.length === 0)) {return}
    
    const target = first.pageUri;
    return <meta httpEquiv="refresh" content={`0;url=${target}`}/>
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
footer {
    text-align: right;
    color: #0000007f;
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

/////////////////////
// Index Transform //
/////////////////////

export const IndexRenderer: FileTransform<HtmlDocument> = {
    pattern: "/",
    virtual: true,
    async render_async({root}) {
        const start = performance.now();
        
        const title = `Index of ${root.name}`;
        const entries = await Array$fromAsync(iterateIndexEntries(root));
        entries.sort(IndexEntry$compare);
        
        const elapsed = performance.now() - start;
        
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
                <footer>
                    Generated in {elapsed.toFixed(0)}ms
                </footer>
            </body>
        </html>);
    },
    renderError_async: renderHtmlError_async,
}
