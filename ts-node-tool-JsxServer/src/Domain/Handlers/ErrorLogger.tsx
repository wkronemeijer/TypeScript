import {formatThrowable, terminal} from "@wkronemeijer/system";
import {ErrorDescription} from "../ResultTypes/ErrorDescription";
import {Response_send} from "../Extensions/Response";
import {HttpStatus} from "../HttpHeader";
import {express} from "../../lib";

export const ErrorLogger: express.ErrorRequestHandler = ((e: unknown, req, res, next) => {
    terminal.error(formatThrowable(e));
    Response_send(res, ErrorDescription("<internal error>"), HttpStatus.INTERNAL_SERVER_ERROR);
});
