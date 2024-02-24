import * as express from "express";

import { formatThrowable, terminal } from "@wkronemeijer/system";
import { ErrorDescription } from "../ResultTypes/ErrorDescription";
import { Response_send } from "../Extensions/Response";

export const ErrorLogger = ((e: unknown, req, res, next) => {
    terminal.error(formatThrowable(e));
    Response_send(res, ErrorDescription("<internal error>"));
}) satisfies express.ErrorRequestHandler;
