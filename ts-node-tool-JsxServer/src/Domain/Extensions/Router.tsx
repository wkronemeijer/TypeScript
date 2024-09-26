import {FileTransform, FileTransformRequest} from "../Transforms/FileTransform";
import {ErrorResponse, TypedResponse} from "../TypedResponse";
import {FileObject, DirectoryObject} from "@wkronemeijer/system-node";
import {TypedResponseBody} from "../TypedResponseBody";
import {Exception, guard, terminal} from "@wkronemeijer/system";
import {ErrorDescription} from "../ResultTypes/ErrorDescription";
import {Response_send} from "./Response";
import {express} from "../../lib";

function determineErrorStatus(error: Error): ErrorResponse["kind"] {
    if (error instanceof Exception) {
        return "Bad Request";
    } else {
        return "Internal Server Error";
    }
}

async function tryRender_async<T extends TypedResponseBody>(
    transform: FileTransform<T>, 
    request: FileTransformRequest,
): Promise<TypedResponse> {
    const {root, file} = request;
    const {
        virtual = false, 
        render_async, 
        renderError_async,
    } = transform;
    
    // I know that (async) checking for exists is a bad idea
    // The alternative is that esbuild or something else downstream creates a more obscure error;
    // all while we know the exact problem right here.
    try {
        guard(file.extends(root), () => 
            `requested resource ${file} must be at or under the root`
        );
        guard(virtual || (await file.exists_async()), () => 
            `resource ${file} does not exist (and is not virtual)`
        );
        return {
            kind: "OK",
            body: await render_async(request),
        };
    } catch (error) {
        terminal.error(`rendering failed: ${String(error)}`);
        try {
            if (error instanceof Error) {
                return {
                    kind: determineErrorStatus(error),
                    body: await renderError_async(error, request),
                };
            }
        } catch (nestedError) {
            terminal.error(`error rendering failed: ${String(nestedError)}`);
            error = nestedError;
        }
        
        return {
            kind: "Internal Server Error", 
            body: ErrorDescription(error)
        };
    }
}

export function Router_registerFileTransform<T extends TypedResponseBody>(
    router: express.Router,
    rootUrl: URL,
    transform: FileTransform<T>,
): void {
    const root = DirectoryObject.fromUrl(rootUrl);
    const {pattern} = transform;
    
    router.get(pattern, async (req, res) => {
        const url = new URL(rootUrl + req.url);
        const file = FileObject.fromUrl(url);
        const requestInfo: FileTransformRequest = {
            rootUrl, root, url, file,
        };
        Response_send(res, await tryRender_async(transform, requestInfo));
    });
    
    // TODO: Allow POST
}
