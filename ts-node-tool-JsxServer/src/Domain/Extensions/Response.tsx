import * as express from "express";

import { MimeTypedString } from "../MimeType";
import { CONTENT_TYPE } from "../HttpHeader";

export function Response_getContentType(self: express.Response): string | number | string[] | undefined {
    return self.getHeader(CONTENT_TYPE);
}

export function Response_shouldLog(self: express.Response): boolean {
    const status = self.statusCode;
    const header = Response_getContentType(self);
    return (
        200 <= status && status < 300 &&
        (typeof header === "string") && header.startsWith("text/")
    );
}

export function Response_send<T extends MimeTypedString>(
    self: express.Response,
    value: T,
): void {
    const { type, body } = value;
    self.setHeader(CONTENT_TYPE, type);
    self.send(body);
}
