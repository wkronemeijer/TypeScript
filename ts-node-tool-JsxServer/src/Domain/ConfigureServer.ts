import { fileURLToPath, pathToFileURL } from "url";
import { extname } from "path";

import { from, swear, terminal } from "@wkronemeijer/system";
import { Directory } from "@wkronemeijer/system-node";

import * as express from "express";

import { ReactFilePattern, isReactFile, renderJsx } from "./RequireJsx";

export function configureServer(RootFolder: string): express.Express {
    const server = express();
    const rootUrl = pathToFileURL(RootFolder);
    
    server.get(ReactFilePattern, async (req, res) => {
        const start = performance.now();
        try {
            const fileUrl = new URL(rootUrl + req.url);
            swear(fileUrl.href.startsWith(rootUrl.href));
            const filePath = fileURLToPath(fileUrl);
            
            res.setHeader("Content-Type", "text/html");
            res.send(await renderJsx(filePath));
        } catch (e) {
            res.setHeader("Content-Type", "text/plain");
            res.send(e instanceof Error ? e.stack : String(e));
        }
        const end = performance.now();
        
        terminal.perf(`${req.url} in ${(end - start).toFixed(4)}ms`);
    });
    
    server.use(express.static(RootFolder, {
        setHeaders(res, path) {
            if (extname(path) === ".dd") {
                res.setHeader("Content-Type", "text/plain");
            }
        },
    }));
    
    server.get("/", async (req, res) => {
        const files = 
            from(new Directory(RootFolder).recursiveGetAllFiles())
            .select(file => file.path)
            .where(isReactFile)
            .toArray()
        ;
        
        res.setHeader("Content-Type", "text/html");
        res.send(`\
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Index</title>
    <link rel="stylesheet" href="/Style.css">
</head>
<body>
    <ul class="__ServerIndex">${files.map(file => {
        const relativeUrl = pathToFileURL(file).href.slice(1 + pathToFileURL(RootFolder).href.length); // +1 for the '/'
        return `<li><a href="${relativeUrl}">${decodeURIComponent(relativeUrl)}</a></li>`;
    }).join("")}</ul>
</body>
</html>`);
    });
    
    return server;
}
