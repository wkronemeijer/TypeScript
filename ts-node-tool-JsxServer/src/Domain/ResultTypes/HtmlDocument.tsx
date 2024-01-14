import { renderToStaticMarkup } from "react-dom/server";
import { ReactElement } from "react";

import { MimeTypedString } from "../MimeType";

// HtmlDocumentBody?
// HtmlDocumentContent?
// HtmlDocumentTextContent?
// TODO: Pick a better name
export type HtmlDocument = MimeTypedString<"text/html">;

/** Renders the JSX to static markup, and prepends the doctype. */
export function HtmlDocument(element: ReactElement): HtmlDocument {
    const body = `<!DOCTYPE html>${renderToStaticMarkup(element)}`;
    // TODO: Insert a check for [meta]description, [meta]viewport, etc.
    // Is there a way to do that without regex?
    // Or parsing the result document.
    return { type: "text/html", body };
}
