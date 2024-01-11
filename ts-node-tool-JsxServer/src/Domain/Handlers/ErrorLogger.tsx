import * as express from "express";
import { terminal } from "@wkronemeijer/system";
import { Response_sendTyped } from "../Extensions/Response";
import { ErrorDescription } from "../ResultTypes/ErrorDescription";

export const ErrorLogger = ((e: unknown, req, res, next) => {
    terminal.error(e instanceof Error ? e.stack : String(e));
    Response_sendTyped(res, ErrorDescription("<internal error>"));
}) satisfies express.ErrorRequestHandler;
