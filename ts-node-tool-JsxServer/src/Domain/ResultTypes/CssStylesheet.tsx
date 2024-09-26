import {TypedResponseBody} from "../TypedResponseBody";

export type CssStylesheet = TypedResponseBody<"text/css">;

/** Renders SCSS to CSS. */
export function CssStylesheet(content: string): CssStylesheet {
    return {
        type: "text/css",
        value: content,
    };
}
