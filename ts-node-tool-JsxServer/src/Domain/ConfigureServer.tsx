import {Router_registerFileTransform} from "./Extensions/Router";
import {JsonManifestRenderer} from "./Transforms/Server/Manifest";
import {JavaScriptRenderer} from "./Transforms/Client/RenderClient";
import {StylesheetRenderer} from "./Transforms/Client/RenderStylesheet";
import {PerformanceLogger} from "./Handlers/PerformanceLogger";
import {ReactPageRenderer} from "./Transforms/Server/Page";
import {JsonPageRenderer} from "./Transforms/Server/Json";
import {FileTransform} from "./Transforms/FileTransform";
import {IndexRenderer} from "./Transforms/Server/Index";
import {pathToFileURL} from "url";
import {AbsolutePath} from "@wkronemeijer/system-node";
import {ErrorLogger} from "./Handlers/ErrorLogger";
import {express} from "../lib";

function configureRouter(rootFolder: AbsolutePath): express.Router {
    const router  = express.Router();
    const rootUrl = pathToFileURL(rootFolder);
    
    function register<T extends FileTransform>(transform: T): void {
        Router_registerFileTransform(router, rootUrl, transform);
    }
    
    router.use(PerformanceLogger);
    {
        // TODO: Maybe pass a list of transforms to configureServer?
        register(IndexRenderer);
        register(JsonManifestRenderer);
        register(JsonPageRenderer);
        register(ReactPageRenderer);
        register(StylesheetRenderer);
        register(JavaScriptRenderer);
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
