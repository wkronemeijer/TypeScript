import { HintedString, Member, StringEnum } from "@wkronemeijer/system";

export type  CommonMimeType = Member<typeof CommonMimeType>;
export const CommonMimeType = StringEnum([
    "text/plain",
    "text/html",
    "text/javascript",
    "text/css",
    "application/json",
]);

export const ShouldLogMimeTypePattern = new RegExp(
    `^(${CommonMimeType.values.join("|")})`
);

export type MimeType = HintedString<CommonMimeType>;

export interface MimeTypedString<K extends MimeType = MimeType> {
    readonly type: K;
    readonly body: string;
}
