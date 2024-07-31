import {JsonResponse, renderJsonError_async} from "../../ResultTypes/JsonResponse";
import {FileTransform} from "../FileTransform";

export const JsonManifestRenderer: FileTransform<JsonResponse> = {
    pattern: /\~(manifest\.json)$/,
    virtual: true,
    async render_async({ file }) {
        const dir = file.parent;
        const files = await dir.recursiveGetAllFiles_async();
        return JsonResponse({
            files: files.map(file => dir.urlTo(file))
        });
    },
    renderError_async: renderJsonError_async,
}
