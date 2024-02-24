import * as express from "express";

import { Response_shouldLog } from "../Extensions/Response";
import { terminal } from "@wkronemeijer/system";

export const PerformanceLogger = ((req, res, next) => {
    const start = performance.now();
    res.once("close", () => {
        const end = performance.now();
        if (Response_shouldLog(res)) {
            terminal.perf(`GET ${req.url} in ${(end - start).toFixed(2)}ms`);
        }
    });
    next();
}) satisfies express.RequestHandler;
