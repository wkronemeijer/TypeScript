import {TypedResponseBody} from "./TypedResponseBody";

export type HttpHeader = (
    | "Content-Type"
    | "Location"
);

// See https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

interface Base<Status extends string> {
    readonly kind: Status;
}

interface TypedReponseWithBody<S extends string> extends Base<S> {
    // We drop the type parameter for TypedResponseBody
    // Doesn't statically prevent errors beyond this point
    // Does make it harder to use with the type parameter everywhere
    readonly body: TypedResponseBody;
}

interface TypedResponseWithLocation<S extends string> extends Base<S> {
    readonly location: string;
}

export type SuccessfulResponse = (
    | TypedReponseWithBody<"OK">
);

export type RedirectionResponse = (
    | TypedResponseWithLocation<"See Other">
);

export type ClientErrorResponse = (
    | TypedReponseWithBody<"Bad Request"> 
    | TypedReponseWithBody<"Not Found">
);

export type ServerErrorResponse = (
    | TypedReponseWithBody<"Internal Server Error">
);

export type ErrorResponse = ClientErrorResponse | ServerErrorResponse;

export type TypedResponse = (
    | SuccessfulResponse
    | RedirectionResponse
    | ErrorResponse
);

export type HttpStatus = TypedResponse["kind"];

export function TypedResponse_getStatusCode(self: TypedResponse): number {
    switch (self.kind) {
        case "OK": return 200;
        
        case "See Other": return 303;
        
        case "Bad Request": return 400;
        case "Not Found"  : return 404;
        
        case "Internal Server Error": return 500;
    }
}
