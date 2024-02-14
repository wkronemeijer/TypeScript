import { JsonReplacer, stringifyJson } from "@wkronemeijer/system";
import { MimeTypedString } from "../MimeType";

export type JsonResponse = MimeTypedString<"application/json">;

export function JsonResponse(value: unknown, replacer?: JsonReplacer): JsonResponse {
    return {
        type: "application/json",
        body: stringifyJson(value, replacer),
    }
}
