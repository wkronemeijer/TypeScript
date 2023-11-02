import { basename, extname } from "path";
import { pathToFileURL } from "url";

import { from, swear, terminal } from "@wkronemeijer/system";
import { AbsolutePath, Directory } from "@wkronemeijer/system-node";

import * as express from "express";

import { ClientSideCodePattern, ReactPagePattern, isReactPage, renderClientSideJsx, renderServerSideJsx } from "./RequireJsx";
import { HtmlDocument } from "./HtmlDocument";
import { Link } from "./Link";

const ContentType = "Content-Type";

function isTextResponse(res: express.Response): boolean {
    const header = res.getHeader(ContentType);
    return (typeof header === "string") && header.startsWith("text/");
}

function configureRouter(rootFolder: AbsolutePath): express.Router {
    const router  = express.Router();
    const rootUrl = pathToFileURL(rootFolder);
    
    const getRelativeUrl = (filePath: string) => {
        const parentUrl = pathToFileURL(rootFolder).href;
        const childUrl  = pathToFileURL(filePath).href;
        return childUrl.slice(parentUrl.length + 1); // +1 for the '/'
    }; 
    
    router.use((req, res, next) => {
        const start = performance.now();
        res.once("close", () => {
            const end = performance.now();
            if (isTextResponse(res)) {
                terminal.perf(`GET ${req.url} in ${(end - start).toFixed(2)}ms`);
            }
        });
        next();
    });
    
    router.get(ReactPagePattern, async (req, res) => {
        try {
            const fileUrl = new URL(rootUrl + req.url);
            swear(fileUrl.href.startsWith(rootUrl.href));
            
            res.setHeader(ContentType, "text/html");
            res.send(await renderServerSideJsx(fileUrl));
        } catch (e) {
            res.setHeader(ContentType, "text/plain");
            res.send(e instanceof Error ? e.stack : String(e));
        }
    });
    
    router.get(ClientSideCodePattern, async (req, res) => {
        try {
            const fileUrl = new URL(rootUrl + req.url);
            swear(fileUrl.href.startsWith(rootUrl.href));
            
            res.setHeader(ContentType, "text/javascript");
            res.send(await renderClientSideJsx(fileUrl));
        } catch (e) {
            res.setHeader(ContentType, "text/plain");
            res.send(e instanceof Error ? e.stack : String(e));
        }
    });
    
    router.get("/", async (req, res) => {
        const title = `Index of ${basename(rootFolder)}`;
        const pages = (
            from(new Directory(rootFolder).recursiveGetAllFiles())
            .select(file => file.path)
            .where(isReactPage)
            .toArray()
        );
        
        res.setHeader(ContentType, "text/html");
        res.send(HtmlDocument(<html>
            <head>
                <title>{title}</title>
            </head>
            <body>
                <h1>{title}</h1>
                <ul className="__ServerIndex">
                    {pages.map(page => 
                    <li key={page}><Link href={getRelativeUrl(page)}/></li>)}
                </ul>
            </body>
        </html>)); 
    });
    
    router.use(express.static(rootFolder, {
        setHeaders(res, path) {
            if (extname(path) === ".dd") {
                res.setHeader(ContentType, "text/plain");
            }
        },
        fallthrough: false,
    }));
    
    return router;
}

export function configureServer(RootFolder: AbsolutePath): express.Express {
    const server = express();
    server.use(configureRouter(RootFolder));
    return server;
}
