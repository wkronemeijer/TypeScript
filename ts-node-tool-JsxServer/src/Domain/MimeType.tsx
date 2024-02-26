import { HintedString } from "@wkronemeijer/system";

export type CommonMimeType = (
    | "text/plain"
    | "text/html"
    | "text/javascript"
    | "text/css"
    | "application/json"
);

export type MimeType = HintedString<CommonMimeType>;

export interface MimeTypedString<K extends MimeType = MimeType> {
    readonly type: K;
    readonly body: string;
}
