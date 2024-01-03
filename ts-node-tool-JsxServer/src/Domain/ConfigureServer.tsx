import { basename, extname } from "path";
import { pathToFileURL } from "url";

import { AbsolutePath, Directory } from "@wkronemeijer/system-node";
import { from, swear, terminal } from "@wkronemeijer/system";

import * as express from "express";

import { ReactPagePattern, isReactPage, renderServerSideJsx_async } from "./Server/RenderServer";
import { ClientSideCodePattern, renderClientSideJsx_async } from "./Client/RenderClient";
import { HtmlDocument } from "./Server/HtmlDocument";
import { Link } from "./Link";

const ContentType = "Content-Type";

function shouldLogResonse(res: express.Response): boolean {
    const header = res.getHeader(ContentType);
    return (
        200 <= res.statusCode && res.statusCode < 300 &&
        (typeof header === "string") && header.startsWith("text/")
    );
}

function configureRouter(rootFolder: AbsolutePath): express.Router {
    const router  = express.Router();
    const rootUrl = pathToFileURL(rootFolder);
    
    const getRelativeUrl = (filePath: string) => {
        const parentUrl = pathToFileURL(rootFolder).href;
        const childUrl  = pathToFileURL(filePath).href;
        return childUrl.slice(parentUrl.length + 1); // +1 to also slice off the leading '/'
    }; 
    
    ///////////////////////////////////////
    // Logging non-media completion time //
    ///////////////////////////////////////
    
    router.use((req, res, next) => {
        const start = performance.now();
        res.once("close", () => {
            const end = performance.now();
            if (shouldLogResonse(res)) {
                terminal.perf(`GET ${req.url} in ${(end - start).toFixed(2)}ms`);
            }
        });
        next();
    }); 
    
    /////////////////
    // Server page //
    /////////////////
    
    router.get(ReactPagePattern, async (req, res) => {
        try {
            const fileUrl = new URL(rootUrl + req.url);
            swear(fileUrl.href.startsWith(rootUrl.href));
            
            res.setHeader(ContentType, "text/html");
            res.send(await renderServerSideJsx_async(fileUrl));
        } catch (e) {
            res.setHeader(ContentType, "text/plain");
            res.send(e instanceof Error ? e.stack : String(e));
        }
    });
    
    /////////////////
    // Client page //
    /////////////////
    
    router.get(ClientSideCodePattern, async (req, res) => {
        try {
            const fileUrl = new URL(rootUrl + req.url);
            swear(fileUrl.href.startsWith(rootUrl.href));
            
            res.setHeader(ContentType, "text/javascript");
            res.send(await renderClientSideJsx_async(fileUrl));
        } catch (e) {
            res.setHeader(ContentType, "text/plain");
            res.send(e instanceof Error ? e.stack : String(e));
        }
    });
    
    ////////////////
    // Root index //
    ////////////////
    
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
        fallthrough: true,
    }));
    
    ///////////////////
    // Error handler //
    ///////////////////
    
    router.use(((err: unknown, req, res, next) => {
        if (err instanceof Error) {
            terminal.error(err.stack);
        } else {
            terminal.error(String(err));
        }
        
        res.setHeader(ContentType, "text/plain");
        res.status(500).send("<internal error>");
    }) satisfies express.ErrorRequestHandler);
    
    return router;
}

export function configureServer(RootFolder: AbsolutePath): express.Express {
    const server = express();
    server.use(configureRouter(RootFolder));
    return server;
}
