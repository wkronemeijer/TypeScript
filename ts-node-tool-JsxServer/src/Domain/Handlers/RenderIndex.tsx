import { pathToFileURL } from "url";
import * as express from "express";

import { AbsolutePath, Directory } from "@wkronemeijer/system-node";
import { from } from "@wkronemeijer/system";

import { Response_sendTyped } from "../Extensions/Response";
import { HtmlDocument } from "../ResultTypes/HtmlDocument";
import { isReactPage } from "../Transforms/ReactPage";
import { Link } from "../Link";

export function getRelativeUrl(rootFolder: string, filePath: string): string {
    const parentUrl = pathToFileURL(rootFolder).href;
    const childUrl = pathToFileURL(filePath).href;
    return childUrl.slice(parentUrl.length + 1); // +1 to also slice off the leading '/'
}

export function createIndexRenderer(rootFolder: AbsolutePath): express.RequestHandler {
    const directory = new Directory(rootFolder);
    const title = `Index of ${directory.fullName}`;
    return (async (req, res) => {
        const pages = (
            from(directory.recursiveGetAllFiles())
            .select(file => file.path)
            .where(isReactPage)
            .toArray()
        );
            
        const responseDoc = HtmlDocument(<html>
            <head>
                <title>{title}</title>
            </head>
            <body>
                <h1>{title}</h1>
                <ul className="__ServerIndex">
                    {pages.map(page =>
                    <li key={page}>
                        <Link href={getRelativeUrl(rootFolder, page)}/>
                    </li>)}
                </ul>
            </body>
        </html>);
        
        Response_sendTyped(res, responseDoc);
    }) satisfies express.RequestHandler;
}
