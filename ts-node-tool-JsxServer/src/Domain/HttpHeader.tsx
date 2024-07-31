export const CONTENT_TYPE = "Content-Type";

export enum HttpStatus {
    /////////
    // 1XX //
    /////////

    /////////
    // 2XX //
    /////////

    OK = 200,
    NO_CONTENT = 204,
    
    /////////
    // 3XX //
    /////////
    
    FOUND     = 302,
    SEE_OTHER = 303,
    
    /////////
    // 4XX //
    /////////
    
    BAD_REQUEST = 400,
    NOT_FOUND   = 404,
    
    /////////
    // 5XX //
    /////////
    
    INTERNAL_SERVER_ERROR = 500,
    
    //////////
    // Meta //
    //////////
    
    default = OK,
}

// Note that 200 OK has just a type and body, 
// but redirects need only a Location header
// (but can still include a body)
// TODO: Use strongly(er)-type reponses
