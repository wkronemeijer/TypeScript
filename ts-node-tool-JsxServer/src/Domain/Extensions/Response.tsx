import {HttpHeader, TypedResponse, TypedResponse_getStatusCode} from "../TypedResponse";
import {ShouldLogMimeTypePattern} from "../TypedResponseBody";
import {express} from "../../lib";

export function Response_getContentType(self: express.Response): (
    | string 
    | number 
    | string[] 
    | undefined
) {
    return self.getHeader("Content-Type" satisfies HttpHeader);
}

export function Response_shouldLog(self: express.Response): boolean {
    const contentType = Response_getContentType(self);
    return (
        typeof contentType === "string" && 
        ShouldLogMimeTypePattern.test(contentType)
    );
}

export function Response_send(
    res: express.Response,
    response: TypedResponse,
): void {
    res.status(TypedResponse_getStatusCode(response));
    
    if (response.kind !== "See Other") {
        const {body} = response;
        res.type(body.type);
        res.send(body.value);
    } else {
        res.header("Location" satisfies HttpHeader, response.location);
        res.send();
    }
}
