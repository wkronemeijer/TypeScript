import { Newtype } from "@wkronemeijer/system";

import { renderToStaticMarkup } from "react-dom/server";
import { ReactElement } from "react";

export type HtmlDocument = Newtype<string, "HtmlDocument">;
// HtmlDocumentBody?
// HtmlDocumentContent?
// HtmlDocumentTextContent?
// TODO: Pick a better name

/** Renders the JSX to static markup, and preprends the doctype. */
export function HtmlDocument(element: ReactElement): HtmlDocument {
    return `<!DOCTYPE html>${renderToStaticMarkup(element)}` as HtmlDocument;
}
