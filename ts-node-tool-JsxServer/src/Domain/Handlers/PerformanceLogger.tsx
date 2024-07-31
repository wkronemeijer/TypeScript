import {Response_shouldLog} from "../Extensions/Response";
import {terminal} from "@wkronemeijer/system";
import {express} from "../../lib";

export const PerformanceLogger: express.RequestHandler = ((req, res, next) => {
    const start = performance.now();
    res.once("finish", () => {
        const end = performance.now();
        if (Response_shouldLog(res)) {
            terminal.perf(`GET \x1b[4m${req.url}\x1b[24m in ${(end - start).toFixed(2)}ms`);
        }
    });
    next();
});
