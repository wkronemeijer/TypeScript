import { MimeTypedString } from "../MimeType";

export type ErrorDescription = MimeTypedString<"text/plain">;

export function ErrorDescription(e: unknown): ErrorDescription {
    return {
        type: "text/plain",
        body: e instanceof Error && e.stack || `Error: ${String(e)}`,
    }
}
