import { MimeTypedString } from "../MimeType";

export type JavaScriptScript = MimeTypedString<"text/javascript">;

/** Renders the JSX to static markup, and preprends the doctype. */
export function JavaScriptScript(content: string): JavaScriptScript {
    // TODO: What could we even verify?
    // The presence of an IIFE?
    // Wouldn't do much.
    return {
        type: "text/javascript",
        body: content,
    };
}
