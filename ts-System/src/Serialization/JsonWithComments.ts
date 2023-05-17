// Specifically the weird version that TS has. 
// i.e. it only supports line and block comments. 

// Apps Hungarian, *gasp*
// Made with https://regex101.com/#javascript
const re_LineComment = /\/\/[^\n]*$/gm;
const re_BlockComment = /\/\*[^]*?\*\//gm;

/** Converts a "JSON with Comments" string into a JavaScript value.  */
export function parseJsonWithComments<T = unknown>(jsonc: string): T {
    return JSON.parse(jsonc
        .replace(re_BlockComment, "")
        .replace(re_LineComment, "")
    );
    /*
    We replace comments in this order because "/*//*/" would bug out with the alternative.
    */
}

// I would implement stringify, but I dont need it lmao
