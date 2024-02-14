import { Router_registerFileTransform } from "./Extensions/Router";
import { pathToFileURL } from "url";
import { AbsolutePath } from "@wkronemeijer/system-node";
import * as express from "express";

import { createIndexRenderer } from "./Handlers/RenderIndex";
import { PerformanceLogger } from "./Handlers/PerformanceLogger";
import { ErrorLogger } from "./Handlers/ErrorLogger";

import { ClientJavaScriptRenderer } from "./Transforms/Client/RenderClient";
import { StylesheetRenderer } from "./Transforms/Client/RenderStylesheet";
import { ReactPageRenderer } from "./Transforms/Server/Page";
import { JsonPageRenderer } from "./Transforms/Server/Json";

function configureRouter(rootFolder: AbsolutePath): express.Router {
    const router  = express.Router();
    const rootUrl = pathToFileURL(rootFolder);
    
    router.use(PerformanceLogger);
    Router_registerFileTransform(router, rootUrl, JsonPageRenderer);
    Router_registerFileTransform(router, rootUrl, ReactPageRenderer);
    Router_registerFileTransform(router, rootUrl, StylesheetRenderer);
    Router_registerFileTransform(router, rootUrl, ClientJavaScriptRenderer);
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
