import * as express from "express";

import { HintedString } from "@wkronemeijer/system";

export type CommonMimeType = (
    | "text/plain"
    | "text/html"
    | "text/javascript"
    | "text/css"
);

export type MimeType = HintedString<CommonMimeType>;

export interface MimeTypedString<K extends MimeType = string> {
    readonly type: K;
    readonly body: string;
}
