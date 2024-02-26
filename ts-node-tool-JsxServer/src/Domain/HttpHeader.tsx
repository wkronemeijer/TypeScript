export const CONTENT_TYPE = "Content-Type";

// An actual enum...🤢
export enum HttpStatusCode {
    // 1XX
    // 2XX
    OK = 200,
    // 3XX
    FOUND = 302,
    SEE_OTHER = 303,
    // 4XX
    NOT_FOUND = 404,
    // 5XX
    
    // Meta
    default = OK,
}

// TODO: Create an enum of HttpResponses
// Note that 200 OK has just a type and body, 
// but redirects need only a Location header
// (but can still include a body)
