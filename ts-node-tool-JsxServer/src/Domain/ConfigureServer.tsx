import {Router_registerFileTransform} from "./Extensions/Router";
import {PerformanceLogger} from "./Handlers/PerformanceLogger";
import {DirectoryObject} from "@wkronemeijer/system-node";
import {ErrorLogger} from "./Handlers/ErrorLogger";
import {express} from "../lib";

import {JsonManifestRenderer} from "./Transforms/Server/Manifest";
import {JavaScriptRenderer} from "./Transforms/Client/RenderClient";
import {StylesheetRenderer} from "./Transforms/Client/RenderStylesheet";
import {ReactPageRenderer} from "./Transforms/Server/Page";
import {JsonPageRenderer} from "./Transforms/Server/Json";
import {FileTransform} from "./Transforms/FileTransform";
import {IndexRenderer} from "./Transforms/Server/Index";
import {SvgRenderer} from "./Transforms/Server/Svg";

function configureRouter(root: DirectoryObject): express.Router {
    const router = express.Router();
    
    function register(transform: FileTransform): void {
        Router_registerFileTransform(router, root.url, transform);
    }
    
    router.use(express.text({
        type: "*/*",
    }));
    router.use(PerformanceLogger);
    {
        register(IndexRenderer);
        register(JsonManifestRenderer);
        register(JsonPageRenderer);
        register(SvgRenderer);
        register(ReactPageRenderer);
        register(StylesheetRenderer);
        
        // Must be last...
        // FIXME: Create and extension (or something) for client-side TS
        // #bundled?
        register(JavaScriptRenderer);
    }
    router.use(express.static(root.path));
    router.use(ErrorLogger);
    
    return router;
}

export function configureServer(root: DirectoryObject): express.Express {
    const server = express();
    server.use(configureRouter(root));
    return server;
}
