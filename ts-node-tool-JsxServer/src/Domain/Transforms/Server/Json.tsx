import { buildAndRunCjs } from "./EvalCjs";
import { FileTransform } from "../FileTransform";
import { JsonResponse } from "../../ResultTypes/JsonResponse";

// JSON often needs some logic, and inner platform effect takes hold
// Easier to just create *.json.ts and expose it as text/json

export const JsonPageRenderer: FileTransform<JsonResponse> = {
    pattern: /\.json\.[jt]s$/,
    async render_async(request) {
        const module = await buildAndRunCjs(request);
        const json = await module.exports.default;
        return JsonResponse(json);
    },
    async renderError_async(error) {
        return JsonResponse({
            $kind: "error",
            $error: error.stack,
        });
    },
}
