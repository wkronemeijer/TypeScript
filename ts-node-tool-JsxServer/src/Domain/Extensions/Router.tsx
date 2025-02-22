import {ErrorResponse, HttpMethod, TypedResponse} from "../TypedResponse";
import {FileTransform, FileTransformRequest} from "../Transforms/FileTransform";
import {FileObject, DirectoryObject} from "@wkronemeijer/system-node";
import {Exception, guard, isString} from "@wkronemeijer/system";
import {TypedResponseBody} from "../TypedResponseBody";
import {ErrorDescription} from "../ResultTypes/ErrorDescription";
import {Response_send} from "./Response";
import {terminal} from "@wkronemeijer/ansi-console";
import {express} from "../../lib";

function determineErrorStatus(error: Error): ErrorResponse["kind"] {
    if (error instanceof Exception) {
        return "Bad Request";
    } else {
        return "Internal Server Error";
    }
}

const BELL = '\x07';

async function tryRender_async<T extends TypedResponseBody>(
    {virtual = false, render_async, renderError_async}: FileTransform<T>, 
    request: FileTransformRequest,
): Promise<TypedResponse> {
    const {root, file} = request;
    
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
        terminal.error(`${BELL}rendering failed: ${String(error)}`);
        try {
            if (error instanceof Error) {
                return {
                    kind: determineErrorStatus(error),
                    body: await renderError_async(error, request),
                };
            }
        } catch (nestedError) {
            terminal.error(
                `${BELL}error rendering failed: ${String(nestedError)}`
            );
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
    
    function createHandler(method: HttpMethod): express.RequestHandler {
        return async (req, res) => {
            const partialRequestUrl = req.url;
            const url = new URL(rootUrl + partialRequestUrl);
            const file = FileObject.fromUrl(url);
            let {body} = req;
            if (!isString(body)) {
               body = undefined; 
            }
            Response_send(res, await tryRender_async(transform, {
                partialRequestUrl,
                rootUrl, 
                method, 
                root, 
                url, 
                file, 
                body,
            }));
        };
    };
    
    const {pattern, allowPost = false} = transform;
    
    router.get(pattern, createHandler("GET"));
    if (allowPost) {
        router.post(pattern, createHandler("POST"));
    }
}
