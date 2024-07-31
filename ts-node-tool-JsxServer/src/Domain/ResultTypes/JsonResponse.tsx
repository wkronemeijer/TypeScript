import {JsonReplacer, stringifyJson} from "@wkronemeijer/system";
import {TypedResponse} from "../MimeType";
import {FileTransform} from "../Transforms/FileTransform";

export type JsonResponse = TypedResponse<"application/json">;

export function JsonResponse(value: unknown, replacer?: JsonReplacer): JsonResponse {
    return {
        type: "application/json",
        body: stringifyJson(value, replacer),
    }
}

export const renderJsonError_async = (async (error: Error): Promise<JsonResponse> => {
    return JsonResponse({
        $kind: "error",
        $error: error.stack,
    });
}) satisfies FileTransform["renderError_async"];
