import { Newtype } from "@wkronemeijer/system";

export type JavaScriptScript = Newtype<string, "JavaScriptScript">;

/** Renders the JSX to static markup, and preprends the doctype. */
export function JavaScriptScript(content: string): JavaScriptScript {
    // TODO: What could we even verify?
    // The presence of an IIFE?
    // Wouldn't do much.
    return content as JavaScriptScript;
}
