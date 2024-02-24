import * as express from "express";

import { Router_registerFileTransform } from "./Extensions/Router";
import { JavaScriptRenderer } from "./Transforms/Client/RenderClient";
import { StylesheetRenderer } from "./Transforms/Client/RenderStylesheet";
import { PerformanceLogger } from "./Handlers/PerformanceLogger";
import { ReactPageRenderer } from "./Transforms/Server/Page";
import { JsonPageRenderer } from "./Transforms/Server/Json";
import { IndexRenderer } from "./Transforms/Server/Index";
import { pathToFileURL } from "url";
import { AbsolutePath } from "@wkronemeijer/system-node";
import { ErrorLogger } from "./Handlers/ErrorLogger";

function configureRouter(rootFolder: AbsolutePath): express.Router {
    const router  = express.Router();
    const rootUrl = pathToFileURL(rootFolder);
    
    router.use(PerformanceLogger);
    {
        Router_registerFileTransform(router, rootUrl, IndexRenderer);
        // TODO: JSON manifest renderer
        Router_registerFileTransform(router, rootUrl, JsonPageRenderer);
        Router_registerFileTransform(router, rootUrl, ReactPageRenderer);
        Router_registerFileTransform(router, rootUrl, StylesheetRenderer);
        Router_registerFileTransform(router, rootUrl, JavaScriptRenderer);
    }
    router.use(express.static(rootFolder));
    router.use(ErrorLogger);
    return router;
}

export function configureServer(rootFolder: AbsolutePath): express.Express {
    const server = express();
    server.use(configureRouter(rootFolder));
    return server;
}
