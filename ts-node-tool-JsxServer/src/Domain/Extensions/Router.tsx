import {ErrorResponse, HttpMethod, TypedResponse} from "../TypedResponse";
import {Exception, guard, isString, terminal} from "@wkronemeijer/system";
import {FileTransform, FileTransformRequest} from "../Transforms/FileTransform";
import {FileObject, DirectoryObject} from "@wkronemeijer/system-node";
import {TypedResponseBody} from "../TypedResponseBody";
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
    const {pattern, allowPost = false} = transform;
    
    function createHandler(method: HttpMethod): express.RequestHandler {
        return async (req, res) => {
            const url = new URL(rootUrl + req.url);
            const file = FileObject.fromUrl(url);
            
            let {body} = req;
            console.log({body, type: typeof body});
            if (!isString(body)) {
               body = undefined; 
            }
            
            Response_send(res, await tryRender_async(transform, {
                method, 
                rootUrl, 
                root, 
                url, 
                file, 
                body,
            }));
        }
    };
    
    router.get(pattern, createHandler("GET"));
    if (allowPost) {
        router.post(pattern, createHandler("POST"));
    }
}
