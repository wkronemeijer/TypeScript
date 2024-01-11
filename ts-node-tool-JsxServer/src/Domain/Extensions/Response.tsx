import * as express from "express";

import { MimeTypedString } from "../MimeType";
import { CONTENT_TYPE } from "../HttpHeader";

export function Response_shouldLog(self: express.Response): boolean {
    const status = self.statusCode;
    const header = self.getHeader(CONTENT_TYPE);
    return (
        200 <= status && status < 300 &&
        (typeof header === "string") && header.startsWith("text/")
    );
}

export function Response_sendTyped<T extends MimeTypedString>(
    self: express.Response,
    value: T,
): void {
    const { type, body } = value;
    self.setHeader(CONTENT_TYPE, type);
    self.send(body);
}
