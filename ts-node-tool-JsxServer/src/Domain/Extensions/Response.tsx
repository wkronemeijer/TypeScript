import {TypedResponse, ShouldLogMimeTypePattern} from "../MimeType";
import {CONTENT_TYPE, HttpStatus} from "../HttpHeader";
import {express} from "../../lib";

export function Response_getContentType(self: express.Response): (
    | string 
    | number 
    | string[] 
    | undefined
) {
    return self.getHeader(CONTENT_TYPE);
}

export function Response_shouldLog(self: express.Response): boolean {
    const contentType = Response_getContentType(self);
    return (
        typeof contentType === "string" && 
        ShouldLogMimeTypePattern.test(contentType)
    );
}

export function Response_send<T extends TypedResponse>(
    self: express.Response,
    value: T,
    status: HttpStatus,
): void {
    self
    .status(status)
    .type(value.type)
    .send(value.body);
}
