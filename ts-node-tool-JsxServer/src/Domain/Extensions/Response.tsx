import * as express from "express";

import { MimeTypedString, ShouldLogMimeTypePattern } from "../MimeType";
import { CONTENT_TYPE, HttpStatusCode } from "../HttpHeader";

export function Response_getContentType(self: express.Response): string | number | string[] | undefined {
    return self.getHeader(CONTENT_TYPE);
}

export function Response_shouldLog(self: express.Response): boolean {
    const contentType = Response_getContentType(self);
    const status      = self.statusCode;
    return (
        status === HttpStatusCode.OK && 
        typeof contentType === "string" && 
        ShouldLogMimeTypePattern.test(contentType)
    );
}

export function Response_send<T extends MimeTypedString>(
    self: express.Response,
    value: T,
    status = HttpStatusCode.default,
): void {
    self
    .status(status)
    .type(value.type)
    .send(value.body);
}
