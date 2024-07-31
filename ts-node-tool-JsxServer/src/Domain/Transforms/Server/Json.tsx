import {JsonResponse, renderJsonError_async} from "../../ResultTypes/JsonResponse";
import {buildAndRunCjs} from "./EvalCjs";
import {FileTransform} from "../FileTransform";

// JSON often needs some logic, and inner platform effect takes hold
// Easier to just create *.json.ts and expose it as text/json

export const JsonPageRenderer: FileTransform<JsonResponse> = {
    pattern: /\.json\.[jt]s$/,
    async render_async(request) {
        const module = await buildAndRunCjs(request);
        const json = await module.exports.default;
        // FIXME: Check if an object can actually be converted to JSON 
        return JsonResponse(json);
    },
    renderError_async: renderJsonError_async,
}
