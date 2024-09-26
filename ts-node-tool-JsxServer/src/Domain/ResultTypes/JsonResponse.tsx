import {JsonReplacer, stringifyJson} from "@wkronemeijer/system";
import {TypedResponseBody} from "../TypedResponseBody";
import {FileTransform} from "../Transforms/FileTransform";

export type JsonResponse = TypedResponseBody<"application/json">;

export function JsonResponse(value: unknown, replacer?: JsonReplacer): JsonResponse {
    return {
        type: "application/json",
        value: stringifyJson(value, replacer),
    }
}

export const renderJsonError_async = (async (error: Error): Promise<JsonResponse> => {
    return JsonResponse({
        $kind: "error",
        $error: error.stack,
    });
}) satisfies FileTransform["renderError_async"];
