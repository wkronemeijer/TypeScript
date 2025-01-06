import {ErrorDescription} from "../ResultTypes/ErrorDescription";
import {formatThrowable} from "@wkronemeijer/system";
import {Response_send} from "../Extensions/Response";
import {terminal} from "@wkronemeijer/ansi-console";
import {express} from "../../lib";

export const ErrorLogger: express.ErrorRequestHandler = ((e: unknown, req, res, next) => {
    terminal.error(formatThrowable(e));
    Response_send(res, {
        kind: "Internal Server Error",
        body: ErrorDescription("<internal error>"),
    });
});
