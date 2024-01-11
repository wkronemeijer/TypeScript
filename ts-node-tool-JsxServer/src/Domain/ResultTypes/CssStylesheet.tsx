import { MimeTypedString } from "../MimeType";

export type CssStylesheet = MimeTypedString<"text/css">;

/** Renders the JSX to static markup, and preprends the doctype. */
export function CssStylesheet(content: string): CssStylesheet {
    // TODO: What could we even verify?
    // The presence of an IIFE?
    // Wouldn't do much.
    return {
        type: "text/css",
        body: content,
    };
}
