
import { ReadonlyURL } from "@wkronemeijer/system";

import { MimeTypedString } from "../MimeType";

export interface FileTransform<T extends MimeTypedString> {
    readonly pattern: RegExp;
    readonly render_async?: (url: ReadonlyURL) => Promise<T>;
    readonly query_async?: (url: ReadonlyURL, body: unknown) => Promise<T>;
}
