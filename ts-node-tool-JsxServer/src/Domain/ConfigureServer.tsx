import { pathToFileURL } from "url";
import * as express from "express";

import { AbsolutePath } from "@wkronemeijer/system-node";

import { Router_registerFileTransform } from "./Extensions/Router";
import { ClientJavaScriptRenderer } from "./Transforms/Client/RenderClient";
import { createIndexRenderer } from "./Handlers/RenderIndex";
import { StylesheetRenderer } from "./Transforms/Client/RenderStylesheet";
import { PerformanceLogger } from "./Handlers/PerformanceLogger";
import { ReactPageRenderer } from "./Transforms/Server/ReactPage";
import { ErrorLogger } from "./Handlers/ErrorLogger";

function configureRouter(rootFolder: AbsolutePath): express.Router {
    const router  = express.Router();
    const rootUrl = pathToFileURL(rootFolder);
    
    router.use(PerformanceLogger);
    Router_registerFileTransform(router, rootUrl, ReactPageRenderer);
    Router_registerFileTransform(router, rootUrl, ClientJavaScriptRenderer);
    Router_registerFileTransform(router, rootUrl, StylesheetRenderer);
    router.get("/", createIndexRenderer(rootFolder));
    router.use(express.static(rootFolder));
    router.use(ErrorLogger);
    return router;
}

export function configureServer(rootFolder: AbsolutePath): express.Express {
    const server = express();
    server.use(configureRouter(rootFolder));
    return server;
}
