import { basename, extname } from "path";
import { pathToFileURL } from "url";

import { from, swear, terminal } from "@wkronemeijer/system";
import { Directory } from "@wkronemeijer/system-node";

import * as express from "express";

import { ReactPagePattern, isReactPage, renderJsx } from "./RequireJsx";
import { HtmlDocument } from "./RenderAndPrefix";

function Link(props: {
    readonly href: string;
}): JSX.Element {
    const { href } = props;
    return <a href={href}>{decodeURIComponent(href).replace(ReactPagePattern, "")}</a>;
}

export function configureServer(RootFolder: string): express.Express {
    const server  = express();
    const rootUrl = pathToFileURL(RootFolder);
    
    const getRelativeUrl = (filePath: string) => {
        const parentUrl = pathToFileURL(RootFolder).href;
        const childUrl  = pathToFileURL(filePath).href;
        return childUrl.slice(parentUrl.length + 1); // +1 for the '/'
    }; 
    
    server.get(ReactPagePattern, async (req, res) => {
        const start = performance.now();
        try {
            const fileUrl = new URL(rootUrl + req.url);
            swear(fileUrl.href.startsWith(rootUrl.href));
            
            res.setHeader("Content-Type", "text/html");
            res.send(await renderJsx(fileUrl));
        } catch (e) {
            res.setHeader("Content-Type", "text/plain");
            res.send(e instanceof Error ? e.stack : String(e));
        }
        const end = performance.now();
        
        terminal.perf(`${req.url} in ${(end - start).toFixed(4)}ms`);
    });
    
    server.get("/", async (req, res) => {
        const title = `Index of ${basename(RootFolder)}`;
        const pages = (
            from(new Directory(RootFolder).recursiveGetAllFiles())
            .select(file => file.path)
            .where(isReactPage)
            .toArray()
        );
        
        res.setHeader("Content-Type", "text/html");
        res.send(HtmlDocument(<html>
            <head>
                <title>{title}</title>
            </head>
            <body>
                <ul className="__ServerIndex">
                    {pages.map(page => 
                    <li key={page}><Link href={getRelativeUrl(page)}/></li>)}
                </ul>
            </body>
        </html>)); 
    });
    
    server.use(express.static(RootFolder, {
        setHeaders(res, path) {
            if (extname(path) === ".dd") {
                res.setHeader("Content-Type", "text/plain");
            }
        },
        fallthrough: false,
    }));
    
    return server;
}
